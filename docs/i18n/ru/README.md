<p align="center"><strong>При поддержке <a href="https://vergex.trade">vergex.trade</a></strong></p>

<p align="center">
  <img src="../../assets/nofx-banner.svg" alt="NOFX — AI trading terminal" width="100%"/>
</p>

<p align="center">
  <a href="https://github.com/NoFxAiOS/nofx/stargazers"><img src="https://img.shields.io/github/stars/NoFxAiOS/nofx?style=flat-square&labelColor=1A1813&color=E0483B" alt="Stars"></a>
  <a href="https://github.com/NoFxAiOS/nofx/releases"><img src="https://img.shields.io/github/v/release/NoFxAiOS/nofx?style=flat-square&labelColor=1A1813&color=E0483B" alt="Release"></a>
  <a href="https://github.com/NoFxAiOS/nofx/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-AGPL--3.0-E0483B?style=flat-square&labelColor=1A1813" alt="License"></a>
  <a href="https://t.me/nofx_dev_community"><img src="https://img.shields.io/badge/telegram-community-E0483B?style=flat-square&labelColor=1A1813&logo=telegram&logoColor=white" alt="Telegram"></a>
</p>

<p align="center">
  <a href="../../../README.md">English</a> ·
  <a href="../zh-CN/README.md">中文</a> ·
  <a href="../ja/README.md">日本語</a> ·
  <a href="../ko/README.md">한국어</a> ·
  <a href="README.md">Русский</a> ·
  <a href="../uk/README.md">Українська</a> ·
  <a href="../vi/README.md">Tiếng Việt</a>
</p>

<br/>

NOFX — торговый терминал с открытым исходным кодом, где стратегией выступает языковая модель. Каждый трейдер работает в непрерывном цикле — читает структуру рынка, принимает решение, исполняет его и записывает ход рассуждений, — а рантайм на Go прижимает каждый ордер к жёстким риск-лимитам, которые модель не может обойти.

Трейдеры собираются свободно: любая модель, любая из девяти бирж, любая стратегия. Запускайте несколько параллельно и сравнивайте их в публичной таблице лидеров по реализованной доходности. Всё работает на вашей собственной машине; биржевые ключи шифруются при хранении и никогда её не покидают.

```bash
curl -fsSL https://raw.githubusercontent.com/NoFxAiOS/nofx/main/install.sh | bash
```

Терминал откроется по адресу `http://127.0.0.1:3000`.

**Первый запуск**

1. Зарегистрируйтесь — первый аккаунт становится владельцем экземпляра.
2. Пройдите пошаговый запуск: положите **$1+ USDC** (сеть Base) в кошелёк для оплаты AI, который он создаст для вас, затем подключите Hyperliquid и внесите **$12+ USDC** для торговли.
3. Запустите **Autopilot**. AI сканирует рынок каждые несколько минут и торгует самостоятельно; каждое решение появляется на дашборде в момент принятия. Остановить можно в любой момент одним кликом.

<br/>

## Регистрация на биржах

NOFX бесплатен и открыт. Открытие счёта по партнёрским ссылкам ниже даёт сниженные торговые комиссии и поддерживает дальнейшую разработку.

| Биржа                                                                                                                      | Статус | Регистрация со скидкой на комиссии                                                          |
| :---------------------------------------------------------------------------------------------------------------------------- | :----: | :---------------------------------------------------------------------------------- |
| <img src="../../../web/public/exchange-icons/binance.jpg" width="20" height="20" style="vertical-align: middle;"/> **Binance**       |   ✅   | [Зарегистрироваться](https://www.binance.com/join?ref=NOFXENG)                                |
| <img src="../../../web/public/exchange-icons/bybit.png" width="20" height="20" style="vertical-align: middle;"/> **Bybit**           |   ✅   | [Зарегистрироваться](https://partner.bybit.com/b/83856)                                       |
| <img src="../../../web/public/exchange-icons/okx.svg" width="20" height="20" style="vertical-align: middle;"/> **OKX**               |   ✅   | [Зарегистрироваться](https://www.okx.com/join/1865360)                                        |
| <img src="../../../web/public/exchange-icons/hyperliquid.png" width="20" height="20" style="vertical-align: middle;"/> **Hyperliquid** |   ✅   | [Зарегистрироваться](https://app.hyperliquid.xyz/join/AITRADING)                              |
| <img src="../../../web/public/exchange-icons/bitget.svg" width="20" height="20" style="vertical-align: middle;"/> **Bitget**         |   ✅   | [Зарегистрироваться](https://www.bitget.com/referral/register?from=referral&clacCode=c8a43172) |
| <img src="../../../web/public/exchange-icons/kucoin.svg" width="20" height="20" style="vertical-align: middle;"/> **KuCoin**         |   ✅   | [Зарегистрироваться](https://www.kucoin.com/r/broker/CXEV7XKK)                                |
| <img src="../../../web/public/exchange-icons/gate.svg" width="20" height="20" style="vertical-align: middle;"/> **Gate**             |   ✅   | [Зарегистрироваться](https://www.gatenode.xyz/share/VQBGUAxY)                                 |
| <img src="../../../web/public/exchange-icons/aster.svg" width="20" height="20" style="vertical-align: middle;"/> **Aster**           |   ✅   | [Зарегистрироваться](https://www.asterdex.com/en/referral/fdfc0e)                             |
| <img src="../../../web/public/exchange-icons/lighter.png" width="20" height="20" style="vertical-align: middle;"/> **Lighter**       |   ✅   | [Зарегистрироваться](https://app.lighter.xyz/?referral=68151432)                              |

<br/>

## Демо

https://github.com/user-attachments/assets/3310f495-14c5-4586-a1cc-3d32e44aa505

<br/>

## Модель предполагает. Рантайм располагает.

Решения основаны на стеке данных [Claw402.ai](https://claw402.ai) · Vergex: живом борде направлений по всему рынку, текущем направлении и его истории для каждого инструмента, тепловых картах себестоимости и ликвидаций и чистом потоке средств. NOFX следует направлению борда; остальные данные служат контекстом исполнения.

Каждый ордер проходит через лимиты, зашитые в код и недоступные модели:

|                          |                                                                                    |
| :----------------------- | :--------------------------------------------------------------------------------- |
| Лимиты позиций          | Максимум одновременных позиций, номинал ограничен долей от капитала, одна позиция на инструмент |
| Ограничение плеча          | Жёсткие пределы применяются при расчёте размера ордера, независимо от того, что запросила модель     |
| Защита на стороне биржи | Стоп-лосс и тейк-профит выставляются на бирже сразу после каждого входа     |
| Автозакрытие по просадке      | Прибыльные позиции, отдавшие слишком много от своего пика, закрываются            |
| Троттлинг сделок         | Минимальное время удержания, кулдауны повторного входа по инструменту, лимиты входов на цикл и на час |
| Безопасный режим                | Повторяющиеся сбои модели блокируют новые входы, пока модель не восстановится                 |
| Предстартовая проверка         | Доступ к модели, средства в кошельке, стратегия и балансы бирж проверяются до того, как трейдер сможет стартовать |

Каждое решение сохраняется вместе с полным ходом рассуждений модели. Ни одной позиции без документального следа.

<br/>

## Терминал

| | |
| :--- | :--- |
| **Autopilot** | Пошаговый запуск: пополнить, подключить, внести депозит, стартовать — с серверной предстартовой проверкой на каждом шаге |
| **Strategy Studio** | Пресеты стилей, наборы монет, индикаторы, плечо, порог уверенности для входа, собственные промпты |
| **Competition** | Публичная таблица лидеров по реализованной доходности, каждая запись привязана к своей модели |
| **Dashboard** | Живые позиции, ордера, статистика и обоснование каждого решения |

<details>
<summary>Скриншоты</summary>

<br/>

|                        Обзор                         |                          График рынка                           |
| :-----------------------------------------------------: | :-------------------------------------------------------------: |
| <img src="../../../screenshots/dashboard-page.png" width="400"/> | <img src="../../../screenshots/dashboard-market-chart.png" width="400"/> |

|                          Статистика торговли                           |                          История позиций                           |
| :--------------------------------------------------------------: | :-----------------------------------------------------------------: |
| <img src="../../../screenshots/dashboard-trading-stats.png" width="400"/> | <img src="../../../screenshots/dashboard-position-history.png" width="400"/> |

|                     Редактор стратегий                      |                      Настройка индикаторов                       |
| :------------------------------------------------------: | :----------------------------------------------------------: |
| <img src="../../../screenshots/strategy-studio.png" width="400"/> | <img src="../../../screenshots/strategy-indicators.png" width="400"/> |

|                     Соревнование                           |                    Конфигурация                              |
| :-------------------------------------------------------: | :-----------------------------------------------------------: |
| <img src="../../../screenshots/competition-page.png" width="400"/> | <img src="../../../screenshots/config-ai-exchanges.png" width="400"/>  |

</details>

<br/>

## Модели

Восемь провайдеров с вашими собственными ключами — DeepSeek, OpenAI, Claude, Qwen, Gemini, Grok, Kimi, MiniMax — включая пользовательские эндпоинты и имена моделей.

Или вовсе без ключей: [Claw402](https://claw402.ai) тарифицирует использование моделей за каждый вызов в USDC по протоколу x402. Кошелёк в сети Base заменяет все API-ключи.

| Провайдер | Доступ |
| :------- | :----- |
| **Claw402** | [AI-модели с оплатой по мере использования и официальной скидкой](https://claw402.ai) |

## Рынки

Криптовалютные бессрочные контракты на всех девяти биржах. На Hyperliquid тот же рантайм торгует также токенизированными акциями США, сырьевыми товарами, индексами, валютными парами и pre-IPO перпетуалами — TSLA, NVDA, GOLD, SPX, EUR, OPENAI — наряду с криптовалютой.

<br/>

## Архитектура

```
    ┌─────────────────────────────────────────────────┐
    │                 Trading Terminal                 │
    │        React · TypeScript · TradingView          │
    │   Dashboard · Strategy Studio · Competition      │
    ├─────────────────────────────────────────────────┤
    │                  API Server (Go)                  │
    │      JWT auth · encrypted credential store        │
    ├──────────────┬──────────────┬───────────────────┤
    │   Strategy    │  Autopilot   │   Trader Runtime  │
    │    Engine     │  Preflight   │    Risk Engine    │
    ├──────────────┴──────────────┴───────────────────┤
    │                 AI Model Layer                    │
    │  DeepSeek · OpenAI · Claude · Qwen · Gemini      │
    │  Grok · Kimi · MiniMax · Claw402 (x402 USDC)     │
    ├─────────────────────────────────────────────────┤
    │              Exchange Connectivity                │
    │ Binance · Bybit · OKX · Hyperliquid · Bitget     │
    │ KuCoin · Gate · Aster · Lighter                  │
    └─────────────────────────────────────────────────┘
```

<br/>

## Установка

**Linux / macOS**

```bash
curl -fsSL https://raw.githubusercontent.com/NoFxAiOS/nofx/main/install.sh | bash
```

**Railway**

[![Deploy on Railway](https://railway.com/button.svg)](https://railway.com/deploy/nofx?referralCode=nofx)

**Docker**

```bash
curl -O https://raw.githubusercontent.com/NoFxAiOS/nofx/main/docker-compose.prod.yml
docker compose -f docker-compose.prod.yml up -d
```

**Windows** — установите [Docker Desktop](https://www.docker.com/products/docker-desktop/), затем:

```powershell
curl -o docker-compose.prod.yml https://raw.githubusercontent.com/NoFxAiOS/nofx/main/docker-compose.prod.yml
docker compose -f docker-compose.prod.yml up -d
```

**Из исходников** — Go 1.21+, Node.js 18+:

```bash
git clone https://github.com/NoFxAiOS/nofx.git && cd nofx
go build -o nofx && ./nofx            # backend
cd web && npm install && npm run dev  # frontend, in a second terminal
```

**Обновление** — повторно запустите скрипт установки; он обновит всё на месте.

<details>
<summary>Развёртывание на сервере</summary>

<br/>

**HTTP**

```bash
curl -fsSL https://raw.githubusercontent.com/NoFxAiOS/nofx/main/install.sh | bash
# http://YOUR_IP:3000
```

**HTTPS через Cloudflare**

1. Добавьте домен в [Cloudflare](https://dash.cloudflare.com) (бесплатный план)
2. A-запись → IP сервера, с проксированием
3. SSL/TLS → Flexible
4. `TRANSPORT_ENCRYPTION=true` в `.env`

</details>

<br/>

## Документация

|                                                         |                                       |
| :------------------------------------------------------ | :------------------------------------ |
| [Начало работы](../../getting-started/README.md)       | Гайды по развёртыванию и биржевым API    |
| [Архитектура](../../architecture/README.md)             | Устройство системы и индекс модулей        |
| [Модуль стратегий](../../architecture/STRATEGY_MODULE.md) | Выбор монет, AI-промпты, исполнение |
| [FAQ](../../guides/faq.en.md)                            | Частые вопросы                      |
| [Устранение неполадок](../../guides/TROUBLESHOOTING.md)       | Диагностика типичных проблем              |

## Сообщество

[Telegram](https://t.me/nofx_dev_community) · [Twitter/X](https://x.com/vergex_ai) · [Issues](https://github.com/NoFxAiOS/nofx/issues) · [vergex.trade](https://vergex.trade) · [Живой дашборд](https://vergex.trade/explore)

## Участие в разработке

Код, документация, переводы и сообщения об ошибках — всё это приветствуется; см. [руководство для контрибьюторов](../../../CONTRIBUTING.md), [кодекс поведения](../../../CODE_OF_CONDUCT.md) и [политику безопасности](../../../SECURITY.md).

NOFX отслеживает значимые вклады и намерен вознаграждать контрибьюторов по мере роста экосистемы. Приоритетные issues имеют больший вес.

| Вклад      | Вес |
| :---------------- | :----: |
| PR по закреплённым issues  | ★★★★★★ |
| Код (принятые PR) | ★★★★★  |
| Исправления ошибок         |  ★★★★  |
| Идеи новых функций     |  ★★★   |
| Сообщения об ошибках       |   ★★   |
| Документация     |   ★★   |

<a href="https://github.com/NoFxAiOS/nofx/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=NoFxAiOS/nofx" alt="Contributors"/>
</a>

## Спонсоры

<a href="https://github.com/pjl914335852-ux"><img src="https://github.com/pjl914335852-ux.png" width="50" height="50" style="border-radius:50%"/></a>
<a href="https://github.com/cat9999aaa"><img src="https://github.com/cat9999aaa.png" width="50" height="50" style="border-radius:50%"/></a>
<a href="https://github.com/1733055465"><img src="https://github.com/1733055465.png" width="50" height="50" style="border-radius:50%"/></a>
<a href="https://github.com/kolal2020"><img src="https://github.com/kolal2020.png" width="50" height="50" style="border-radius:50%"/></a>
<a href="https://github.com/CyberFFarm"><img src="https://github.com/CyberFFarm.png" width="50" height="50" style="border-radius:50%"/></a>
<a href="https://github.com/vip3001003"><img src="https://github.com/vip3001003.png" width="50" height="50" style="border-radius:50%"/></a>
<a href="https://github.com/mrtluh"><img src="https://github.com/mrtluh.png" width="50" height="50" style="border-radius:50%"/></a>
<a href="https://github.com/cpcp1117-source"><img src="https://github.com/cpcp1117-source.png" width="50" height="50" style="border-radius:50%"/></a>
<a href="https://github.com/match-007"><img src="https://github.com/match-007.png" width="50" height="50" style="border-radius:50%"/></a>
<a href="https://github.com/leiwuhen1715"><img src="https://github.com/leiwuhen1715.png" width="50" height="50" style="border-radius:50%"/></a>
<a href="https://github.com/SHAOXIA1991"><img src="https://github.com/SHAOXIA1991.png" width="50" height="50" style="border-radius:50%"/></a>

[Стать спонсором](https://github.com/sponsors/NoFxAiOS)

<br/>

Если NOFX вам полезен, звезда помогает другим трейдерам его найти.

[![Star History Chart](https://star-history.dera.page/svg?repos=NoFxAiOS/nofx&type=Date)](https://star-history.dera.page/#NoFxAiOS/nofx&Date)

## Лицензия

[AGPL-3.0](../../../LICENSE)

<sub>Автоматическая торговля сопряжена со значительным риском. Стратегии на основе AI экспериментальны и могут терять деньги. Разумно выбирайте размер позиций, разбирайтесь в устройстве каждой площадки и никогда не торгуйте средствами, потерю которых не можете себе позволить. Полный [дисклеймер](../../../DISCLAIMER.md).</sub>
