package market

import (
	"encoding/json"
	"fmt"
	"log"
	"sync"
	"time"

	"github.com/gorilla/websocket"
)

type WSClient struct {
	conn        *websocket.Conn
	mu          sync.RWMutex
	subscribers map[string]chan []byte
	reconnect   bool
	done        chan struct{}
}

type WSMessage struct {
	Stream string          `json:"stream"`
	Data   json.RawMessage `json:"data"`
}

type KlineWSData struct {
	EventType string `json:"e"`
	EventTime int64  `json:"E"`
	Symbol    string `json:"s"`
	Kline     struct {
		StartTime           int64  `json:"t"`
		CloseTime           int64  `json:"T"`
		Symbol              string `json:"s"`
		Interval            string `json:"i"`
		FirstTradeID        int64  `json:"f"`
		LastTradeID         int64  `json:"L"`
		OpenPrice           string `json:"o"`
		ClosePrice          string `json:"c"`
		HighPrice           string `json:"h"`
		LowPrice            string `json:"l"`
		Volume              string `json:"v"`
		NumberOfTrades      int    `json:"n"`
		IsFinal             bool   `json:"x"`
		QuoteVolume         string `json:"q"`
		TakerBuyBaseVolume  string `json:"V"`
		TakerBuyQuoteVolume string `json:"Q"`
	} `json:"k"`
}

type TickerWSData struct {
	EventType          string `json:"e"`
	EventTime          int64  `json:"E"`
	Symbol             string `json:"s"`
	PriceChange        string `json:"p"`
	PriceChangePercent string `json:"P"`
	WeightedAvgPrice   string `json:"w"`
	LastPrice          string `json:"c"`
	LastQty            string `json:"Q"`
	OpenPrice          string `json:"o"`
	HighPrice          string `json:"h"`
	LowPrice           string `json:"l"`
	Volume             string `json:"v"`
	QuoteVolume        string `json:"q"`
	OpenTime           int64  `json:"O"`
	CloseTime          int64  `json:"C"`
	FirstID            int64  `json:"F"`
	LastID             int64  `json:"L"`
	Count              int    `json:"n"`
}

func NewWSClient() *WSClient {
	return &WSClient{
		subscribers: make(map[string]chan []byte),
		reconnect:   true,
		done:        make(chan struct{}),
	}
}

func (w *WSClient) Connect() error {
	dialer := websocket.Dialer{
		HandshakeTimeout: 10 * time.Second,
	}

	conn, _, err := dialer.Dial("wss://ws-fapi.binance.com/ws-fapi/v1", nil)
	if err != nil {
		return fmt.Errorf("WebSocket连接失败: %v", err)
	}

	w.mu.Lock()
	w.conn = conn
	w.mu.Unlock()

	log.Println("WebSocket连接成功")

	// 启动消息读取循环
	go w.readMessages()

	return nil
}

func (w *WSClient) SubscribeKline(symbol, interval string) error {
	stream := fmt.Sprintf("%s@kline_%s", symbol, interval)
	return w.subscribe(stream)
}

func (w *WSClient) SubscribeTicker(symbol string) error {
	stream := fmt.Sprintf("%s@ticker", symbol)
	return w.subscribe(stream)
}

func (w *WSClient) SubscribeMiniTicker(symbol string) error {
	stream := fmt.Sprintf("%s@miniTicker", symbol)
	return w.subscribe(stream)
}

func (w *WSClient) subscribe(stream string) error {
	subscribeMsg := map[string]interface{}{
		"method": "SUBSCRIBE",
		"params": []string{stream},
		"id":     time.Now().Unix(),
	}

	w.mu.RLock()
	defer w.mu.RUnlock()

	if w.conn == nil {
		return fmt.Errorf("WebSocket未连接")
	}

	err := w.conn.WriteJSON(subscribeMsg)
	if err != nil {
		return err
	}

	log.Printf("订阅流: %s", stream)
	return nil
}

func (w *WSClient) readMessages() {
	for {
		select {
		case <-w.done:
			return
		default:
			w.mu.RLock()
			conn := w.conn
			w.mu.RUnlock()

			if conn == nil {
				time.Sleep(1 * time.Second)
				continue
			}

			_, message, err := conn.ReadMessage()
			if err != nil {
				log.Printf("读取WebSocket消息失败: %v", err)
				w.handleReconnect()
				return
			}

			w.handleMessage(message)
		}
	}
}

func (w *WSClient) handleMessage(message []byte) {
	var wsMsg WSMessage
	if err := json.Unmarshal(message, &wsMsg); err != nil {
		// 可能是其他格式的消息
		return
	}

	w.mu.RLock()
	ch, exists := w.subscribers[wsMsg.Stream]
	w.mu.RUnlock()

	if exists {
		select {
		case ch <- wsMsg.Data:
		default:
			log.Printf("订阅者通道已满: %s", wsMsg.Stream)
		}
	}
}

func (w *WSClient) handleReconnect() {
	if !w.reconnect {
		return
	}

	log.Println("尝试重新连接...")
	time.Sleep(3 * time.Second)

	if err := w.Connect(); err != nil {
		log.Printf("重新连接失败: %v", err)
		go w.handleReconnect()
	}
}

func (w *WSClient) AddSubscriber(stream string, bufferSize int) <-chan []byte {
	ch := make(chan []byte, bufferSize)
	w.mu.Lock()
	w.subscribers[stream] = ch
	w.mu.Unlock()
	return ch
}

func (w *WSClient) RemoveSubscriber(stream string) {
	w.mu.Lock()
	delete(w.subscribers, stream)
	w.mu.Unlock()
}

func (w *WSClient) Close() {
	w.reconnect = false
	close(w.done)

	w.mu.Lock()
	defer w.mu.Unlock()

	if w.conn != nil {
		w.conn.Close()
		w.conn = nil
	}

	// 关闭所有订阅者通道
	for stream, ch := range w.subscribers {
		close(ch)
		delete(w.subscribers, stream)
	}
}
