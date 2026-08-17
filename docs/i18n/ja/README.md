<p align="center"><strong><a href="https://vergex.trade">vergex.trade</a> の支援を受けています</strong></p>

<p align="center">
  <img src="../../assets/nofx-banner.svg" alt="NOFX — AI トレーディングターミナル" width="100%"/>
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
  <a href="README.md">日本語</a> ·
  <a href="../ko/README.md">한국어</a> ·
  <a href="../ru/README.md">Русский</a> ·
  <a href="../uk/README.md">Українська</a> ·
  <a href="../vi/README.md">Tiếng Việt</a>
</p>

<br/>

NOFX は、戦略そのものが言語モデルであるオープンソースのトレーディングターミナルです。各トレーダーは、市場構造を読み取り、判断し、執行し、その根拠を記録するという連続的なループを回し続けます。その間、Go ランタイムがすべての注文を、モデルには上書きできないハードなリスク制限内に抑え込みます。

トレーダーの構成は自由です。任意のモデル、9 つの取引所のいずれか、任意の戦略を組み合わせられます。複数のトレーダーを並行して走らせ、実現リターンに基づく公開リーダーボードで比較できます。すべては自分のマシン上で動作し、取引所の認証情報は保存時に暗号化され、外部に送信されることはありません。

```bash
curl -fsSL https://raw.githubusercontent.com/NoFxAiOS/nofx/main/install.sh | bash
```

ターミナルは `http://127.0.0.1:3000` で開きます。

**初回起動**

1. 登録します — 最初に作成したアカウントがこのインスタンスのオーナーになります。
2. ガイド付きの起動手順に従います。自動作成される AI 手数料ウォレットに **$1+ USDC**（Base ネットワーク）を入金し、続いて Hyperliquid を接続して取引資金として **$12+ USDC** を入金します。
3. **Autopilot** を開始します。AI は数分ごとに市場をスキャンして自律的に取引し、すべての判断はその場でダッシュボードに表示されます。ワンクリックでいつでも停止できます。

<br/>

## 取引所の登録

NOFX は無料のオープンソースソフトウェアです。以下のパートナーリンク経由で口座を開設すると、取引手数料の割引が受けられるうえ、継続的な開発の資金にもなります。

| 取引所                                                                                                                      | 状態 | 手数料割引付きで登録                                                          |
| :---------------------------------------------------------------------------------------------------------------------------- | :----: | :---------------------------------------------------------------------------------- |
| <img src="../../../web/public/exchange-icons/binance.jpg" width="20" height="20" style="vertical-align: middle;"/> **Binance**       |   ✅   | [登録](https://www.binance.com/join?ref=NOFXENG)                                |
| <img src="../../../web/public/exchange-icons/bybit.png" width="20" height="20" style="vertical-align: middle;"/> **Bybit**           |   ✅   | [登録](https://partner.bybit.com/b/83856)                                       |
| <img src="../../../web/public/exchange-icons/okx.svg" width="20" height="20" style="vertical-align: middle;"/> **OKX**               |   ✅   | [登録](https://www.okx.com/join/1865360)                                        |
| <img src="../../../web/public/exchange-icons/hyperliquid.png" width="20" height="20" style="vertical-align: middle;"/> **Hyperliquid** |   ✅   | [登録](https://app.hyperliquid.xyz/join/AITRADING)                              |
| <img src="../../../web/public/exchange-icons/bitget.svg" width="20" height="20" style="vertical-align: middle;"/> **Bitget**         |   ✅   | [登録](https://www.bitget.com/referral/register?from=referral&clacCode=c8a43172) |
| <img src="../../../web/public/exchange-icons/kucoin.svg" width="20" height="20" style="vertical-align: middle;"/> **KuCoin**         |   ✅   | [登録](https://www.kucoin.com/r/broker/CXEV7XKK)                                |
| <img src="../../../web/public/exchange-icons/gate.svg" width="20" height="20" style="vertical-align: middle;"/> **Gate**             |   ✅   | [登録](https://www.gatenode.xyz/share/VQBGUAxY)                                 |
| <img src="../../../web/public/exchange-icons/aster.svg" width="20" height="20" style="vertical-align: middle;"/> **Aster**           |   ✅   | [登録](https://www.asterdex.com/en/referral/fdfc0e)                             |
| <img src="../../../web/public/exchange-icons/lighter.png" width="20" height="20" style="vertical-align: middle;"/> **Lighter**       |   ✅   | [登録](https://app.lighter.xyz/?referral=68151432)                              |

<br/>

## デモ

https://github.com/user-attachments/assets/3310f495-14c5-4586-a1cc-3d32e44aa505

<br/>

## モデルは提案する。ランタイムが決める。

判断は [Claw402.ai](https://claw402.ai)・Vergex のデータスタックに基づきます。全市場のライブ方向ボード、銘柄ごとの現在方向と方向履歴、コストベース・清算ヒートマップ、リアルタイムのネットフローを利用します。NOFX はボード方向に従い、その他のデータは執行コンテキストとして扱います。

すべての注文は、モデルの手が届かない、コードで強制されるリスク制限を通過します。

|                          |                                                                                    |
| :----------------------- | :--------------------------------------------------------------------------------- |
| ポジション制限          | 同時ポジション数の上限、想定元本は口座資産に対する比率で制限、1 シンボルにつき 1 ポジション |
| レバレッジ制限          | モデルの要求とは無関係に、注文サイズの算出時にハードキャップを適用     |
| 取引所側の保護 | すべてのエントリー直後に、ストップロスとテイクプロフィットを取引所側に設置     |
| ドローダウン自動クローズ      | ピークから利益を大きく吐き出したポジションは自動的にクローズ            |
| 取引スロットリング         | 最低保有時間、シンボルごとの再エントリークールダウン、サイクルごと・1 時間ごとのエントリー回数制限 |
| セーフモード                | モデルの失敗が繰り返された場合、モデルが回復するまで新規エントリーをブロック                 |
| 起動前チェック         | トレーダーの開始前に、モデルアクセス、ウォレット資金、戦略、取引所残高を検証 |

各判断は、モデルの推論全文とともに保存されます。記録の残らないポジションは存在しません。

<br/>

## ターミナル

| | |
| :--- | :--- |
| **Autopilot** | ガイド付きの起動フロー：資金投入、接続、入金、開始 — 全工程をサーバー側の事前チェックが支えます |
| **Strategy Studio** | スタイルプリセット、コインユニバース、インジケーター、レバレッジ、エントリー確信度、カスタムプロンプト |
| **Competition** | 実現リターンでランク付けされる公開リーダーボード。各エントリーには使用モデルが明記されます |
| **Dashboard** | ライブのポジション、注文、統計、そしてすべての判断の背後にある推論 |

<details>
<summary>スクリーンショット</summary>

<br/>

|                        概要                         |                          マーケットチャート                           |
| :-----------------------------------------------------: | :-------------------------------------------------------------: |
| <img src="../../../screenshots/dashboard-page.png" width="400"/> | <img src="../../../screenshots/dashboard-market-chart.png" width="400"/> |

|                          取引統計                           |                          ポジション履歴                           |
| :--------------------------------------------------------------: | :-----------------------------------------------------------------: |
| <img src="../../../screenshots/dashboard-trading-stats.png" width="400"/> | <img src="../../../screenshots/dashboard-position-history.png" width="400"/> |

|                     戦略エディタ                      |                      インジケーター設定                       |
| :------------------------------------------------------: | :----------------------------------------------------------: |
| <img src="../../../screenshots/strategy-studio.png" width="400"/> | <img src="../../../screenshots/strategy-indicators.png" width="400"/> |

|                     コンペティション                           |                    設定                              |
| :-------------------------------------------------------: | :-----------------------------------------------------------: |
| <img src="../../../screenshots/competition-page.png" width="400"/> | <img src="../../../screenshots/config-ai-exchanges.png" width="400"/>  |

</details>

<br/>

## モデル

自分の API キーで 8 つのプロバイダーを利用できます — DeepSeek、OpenAI、Claude、Qwen、Gemini、Grok、Kimi、MiniMax。カスタムエンドポイントとカスタムモデル名にも対応しています。

あるいは、キーを一切使わない方法もあります。[Claw402](https://claw402.ai) は x402 プロトコル上で、モデルの利用量を呼び出しごとに USDC で課金します。Base 上のウォレットひとつが、すべての API キーの代わりになります。

| プロバイダー | アクセス |
| :------- | :----- |
| **Claw402** | [公式割引付きの従量課金 AI モデル](https://claw402.ai) |

## マーケット

9 つの取引所すべてで暗号資産の無期限先物を取引できます。Hyperliquid では、同じランタイムが暗号資産に加えて、トークン化された米国株、コモディティ、株価指数、FX、プレ IPO 無期限先物 — TSLA、NVDA、GOLD、SPX、EUR、OPENAI — も取引します。

<br/>

## アーキテクチャ

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

## インストール

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

**Windows** — [Docker Desktop](https://www.docker.com/products/docker-desktop/) をインストールしてから、次を実行します。

```powershell
curl -o docker-compose.prod.yml https://raw.githubusercontent.com/NoFxAiOS/nofx/main/docker-compose.prod.yml
docker compose -f docker-compose.prod.yml up -d
```

**ソースからビルド** — Go 1.21+、Node.js 18+ が必要です。

```bash
git clone https://github.com/NoFxAiOS/nofx.git && cd nofx
go build -o nofx && ./nofx            # backend
cd web && npm install && npm run dev  # frontend, in a second terminal
```

**アップデート** — インストールスクリプトを再実行すると、その場でアップグレードされます。

<details>
<summary>サーバーへのデプロイ</summary>

<br/>

**HTTP**

```bash
curl -fsSL https://raw.githubusercontent.com/NoFxAiOS/nofx/main/install.sh | bash
# http://YOUR_IP:3000
```

**Cloudflare 経由の HTTPS**

1. [Cloudflare](https://dash.cloudflare.com)（無料プラン）にドメインを追加
2. A レコード → サーバー IP（Proxied を有効化）
3. SSL/TLS → Flexible
4. `.env` に `TRANSPORT_ENCRYPTION=true` を設定

</details>

<br/>

## ドキュメント

|                                                         |                                       |
| :------------------------------------------------------ | :------------------------------------ |
| [はじめに](../../getting-started/README.md)       | デプロイと取引所 API のガイド    |
| [アーキテクチャ](../../architecture/README.md)             | システム設計とモジュール索引        |
| [戦略モジュール](../../architecture/STRATEGY_MODULE.md) | 銘柄選択、AI プロンプト、執行 |
| [FAQ](../../guides/faq.en.md)                            | よくある質問                      |
| [トラブルシューティング](../../guides/TROUBLESHOOTING.md)       | よくある問題の診断              |

## コミュニティ

[Telegram](https://t.me/nofx_dev_community) · [Twitter/X](https://x.com/vergex_ai) · [Issues](https://github.com/NoFxAiOS/nofx/issues) · [vergex.trade](https://vergex.trade) · [ライブダッシュボード](https://vergex.trade/explore)

## コントリビューション

コード、ドキュメント、翻訳、バグ報告のいずれも歓迎します。詳細は[貢献ガイド](../../../CONTRIBUTING.md)、[行動規範](../../../CODE_OF_CONDUCT.md)、[セキュリティポリシー](../../../SECURITY.md)をご覧ください。

NOFX は有意義な貢献を記録しており、エコシステムの成長に応じて貢献者に還元していく予定です。優先度の高い Issue にはより高いウェイトが付きます。

| 貢献の種類      | ウェイト |
| :---------------- | :----: |
| ピン留め Issue の PR  | ★★★★★★ |
| コード（マージ済み PR） | ★★★★★  |
| バグ修正         |  ★★★★  |
| 機能アイデア     |  ★★★   |
| バグ報告       |   ★★   |
| ドキュメント     |   ★★   |

<a href="https://github.com/NoFxAiOS/nofx/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=NoFxAiOS/nofx" alt="Contributors"/>
</a>

## スポンサー

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

[スポンサーになる](https://github.com/sponsors/NoFxAiOS)

<br/>

NOFX が役に立ったら、スターを付けていただけると、他のトレーダーがこのプロジェクトを見つけやすくなります。

[![Star History Chart](https://star-history.dera.page/svg?repos=NoFxAiOS/nofx&type=Date)](https://star-history.dera.page/#NoFxAiOS/nofx&Date)

## ライセンス

[AGPL-3.0](../../../LICENSE)

<sub>自動売買には大きなリスクが伴います。AI 駆動の戦略は実験的なものであり、損失を出す可能性があります。適切なポジションサイズを守り、各取引所の仕組みを理解し、失っても差し支えのない資金以外では決して取引しないでください。詳細は[免責事項](../../../DISCLAIMER.md)をご覧ください。</sub>
