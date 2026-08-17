<p align="center"><strong><a href="https://vergex.trade">vergex.trade</a>가 지원합니다</strong></p>

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
  <a href="README.md">한국어</a> ·
  <a href="../ru/README.md">Русский</a> ·
  <a href="../uk/README.md">Українська</a> ·
  <a href="../vi/README.md">Tiếng Việt</a>
</p>

<br/>

NOFX는 언어 모델이 곧 전략이 되는 오픈소스 트레이딩 터미널입니다. 각 트레이더는 시장 구조 읽기, 판단, 실행, 근거 기록으로 이어지는 루프를 끊임없이 반복하고, Go 런타임은 모든 주문을 모델이 절대 우회할 수 없는 하드 리스크 한도 안에 묶어 둡니다.

트레이더는 자유롭게 조합할 수 있습니다. 어떤 모델이든, 아홉 개 거래소 중 어디든, 어떤 전략이든 가능합니다. 여러 트레이더를 나란히 돌리면서 실현 수익률 기준의 공개 리더보드에서 비교해 보세요. 모든 것은 사용자의 머신에서 실행되며, 거래소 자격 증명은 저장 시 암호화되고 절대 외부로 나가지 않습니다.

```bash
curl -fsSL https://raw.githubusercontent.com/NoFxAiOS/nofx/main/install.sh | bash
```

터미널은 `http://127.0.0.1:3000`에서 열립니다.

**첫 실행**

1. 계정을 등록합니다 — 첫 번째 계정이 해당 인스턴스의 소유자가 됩니다.
2. 가이드 런치를 따라갑니다. 자동으로 생성된 AI 수수료 지갑에 **$1+ USDC**(Base 네트워크)를 넣은 뒤, Hyperliquid를 연결하고 거래 자금으로 **$12+ USDC**를 입금합니다.
3. **Autopilot**을 시작합니다. AI가 몇 분마다 시장을 스캔하며 스스로 거래하고, 모든 결정은 발생하는 즉시 대시보드에 표시됩니다. 언제든 클릭 한 번으로 중지할 수 있습니다.

<br/>

## 거래소 등록

NOFX는 무료 오픈소스입니다. 아래 파트너 링크로 계정을 개설하면 거래 수수료가 할인되며, 프로젝트의 지속적인 개발에도 보탬이 됩니다.

| 거래소                                                                                                                      | 상태 | 수수료 할인 등록                                                          |
| :---------------------------------------------------------------------------------------------------------------------------- | :----: | :---------------------------------------------------------------------------------- |
| <img src="../../../web/public/exchange-icons/binance.jpg" width="20" height="20" style="vertical-align: middle;"/> **Binance**       |   ✅   | [등록](https://www.binance.com/join?ref=NOFXENG)                                |
| <img src="../../../web/public/exchange-icons/bybit.png" width="20" height="20" style="vertical-align: middle;"/> **Bybit**           |   ✅   | [등록](https://partner.bybit.com/b/83856)                                       |
| <img src="../../../web/public/exchange-icons/okx.svg" width="20" height="20" style="vertical-align: middle;"/> **OKX**               |   ✅   | [등록](https://www.okx.com/join/1865360)                                        |
| <img src="../../../web/public/exchange-icons/hyperliquid.png" width="20" height="20" style="vertical-align: middle;"/> **Hyperliquid** |   ✅   | [등록](https://app.hyperliquid.xyz/join/AITRADING)                              |
| <img src="../../../web/public/exchange-icons/bitget.svg" width="20" height="20" style="vertical-align: middle;"/> **Bitget**         |   ✅   | [등록](https://www.bitget.com/referral/register?from=referral&clacCode=c8a43172) |
| <img src="../../../web/public/exchange-icons/kucoin.svg" width="20" height="20" style="vertical-align: middle;"/> **KuCoin**         |   ✅   | [등록](https://www.kucoin.com/r/broker/CXEV7XKK)                                |
| <img src="../../../web/public/exchange-icons/gate.svg" width="20" height="20" style="vertical-align: middle;"/> **Gate**             |   ✅   | [등록](https://www.gatenode.xyz/share/VQBGUAxY)                                 |
| <img src="../../../web/public/exchange-icons/aster.svg" width="20" height="20" style="vertical-align: middle;"/> **Aster**           |   ✅   | [등록](https://www.asterdex.com/en/referral/fdfc0e)                             |
| <img src="../../../web/public/exchange-icons/lighter.png" width="20" height="20" style="vertical-align: middle;"/> **Lighter**       |   ✅   | [등록](https://app.lighter.xyz/?referral=68151432)                              |

<br/>

## 데모

https://github.com/user-attachments/assets/3310f495-14c5-4586-a1cc-3d32e44aa505

<br/>

## 모델은 제안하고, 런타임이 결정합니다

의사결정은 [Claw402.ai](https://claw402.ai) · Vergex 데이터 스택을 기반으로 합니다. 전체 시장의 실시간 방향 보드, 종목별 현재 방향과 방향 이력, 코스트·청산 히트맵, 실시간 순유입을 사용합니다. NOFX는 보드 방향을 따르며 나머지 데이터는 실행 맥락으로만 사용합니다.

모든 주문은 모델의 손이 닿지 않는 곳에서 코드로 강제되는 한도를 통과해야 합니다.

|                          |                                                                                    |
| :----------------------- | :--------------------------------------------------------------------------------- |
| 포지션 한도          | 최대 동시 포지션 수, 자본 대비 비율로 상한이 걸린 명목 금액, 심볼당 포지션 1개 |
| 레버리지 클램프          | 모델이 무엇을 요청하든 관계없이 주문 크기 산정 시점에 적용되는 하드 캡     |
| 거래소 측 보호 | 모든 진입 직후 거래소에 스탑로스와 테이크프로핏을 즉시 배치     |
| 드로다운 자동 청산      | 고점 대비 이익을 과도하게 반납한 수익 포지션은 자동으로 청산            |
| 거래 스로틀링         | 최소 보유 시간, 심볼별 재진입 쿨다운, 사이클당·시간당 진입 횟수 제한 |
| 세이프 모드                | 모델 오류가 반복되면 모델이 복구될 때까지 신규 진입을 차단                 |
| 런치 프리플라이트         | 트레이더 시작 전에 모델 접근성, 지갑 자금, 전략, 거래소 잔고를 검증 |

각 결정은 모델의 전체 추론 과정과 함께 저장됩니다. 기록 없는 포지션은 존재하지 않습니다.

<br/>

## 터미널

| | |
| :--- | :--- |
| **Autopilot** | 가이드 런치: 자금 입금, 연결, 예치, 시작 — 전 과정에 서버 측 프리플라이트 적용 |
| **Strategy Studio** | 스타일 프리셋, 코인 유니버스, 지표, 레버리지, 진입 신뢰도, 커스텀 프롬프트 |
| **경쟁** | 실현 수익률로 순위가 매겨지는 공개 리더보드, 각 항목마다 사용한 모델 표기 |
| **대시보드** | 실시간 포지션, 주문, 통계, 그리고 모든 결정 뒤에 있는 추론 과정 |

<details>
<summary>스크린샷</summary>

<br/>

|                        개요                         |                          마켓 차트                           |
| :-----------------------------------------------------: | :-------------------------------------------------------------: |
| <img src="../../../screenshots/dashboard-page.png" width="400"/> | <img src="../../../screenshots/dashboard-market-chart.png" width="400"/> |

|                          거래 통계                           |                          포지션 기록                           |
| :--------------------------------------------------------------: | :-----------------------------------------------------------------: |
| <img src="../../../screenshots/dashboard-trading-stats.png" width="400"/> | <img src="../../../screenshots/dashboard-position-history.png" width="400"/> |

|                     전략 에디터                      |                      지표 설정                       |
| :------------------------------------------------------: | :----------------------------------------------------------: |
| <img src="../../../screenshots/strategy-studio.png" width="400"/> | <img src="../../../screenshots/strategy-indicators.png" width="400"/> |

|                     경쟁                           |                    설정                              |
| :-------------------------------------------------------: | :-----------------------------------------------------------: |
| <img src="../../../screenshots/competition-page.png" width="400"/> | <img src="../../../screenshots/config-ai-exchanges.png" width="400"/>  |

</details>

<br/>

## 모델

자신의 키로 사용할 수 있는 여덟 개 제공업체 — DeepSeek, OpenAI, Claude, Qwen, Gemini, Grok, Kimi, MiniMax — 커스텀 엔드포인트와 모델 이름도 지원합니다.

키가 전혀 없어도 됩니다. [Claw402](https://claw402.ai)는 x402 프로토콜을 통해 모델 사용량을 호출 단위로 USDC로 정산합니다. Base 네트워크의 지갑 하나가 모든 API 키를 대신합니다.

| 제공업체 | 이용 방법 |
| :------- | :----- |
| **Claw402** | [공식 할인이 적용된 종량제 AI 모델](https://claw402.ai) |

## 시장

아홉 개 거래소 전체에서 암호화폐 무기한 선물을 거래합니다. Hyperliquid에서는 같은 런타임이 암호화폐와 함께 토큰화된 미국 주식, 원자재, 지수, 외환, 프리 IPO 무기한 선물 — TSLA, NVDA, GOLD, SPX, EUR, OPENAI — 도 거래합니다.

<br/>

## 아키텍처

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

## 설치

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

**Windows** — [Docker Desktop](https://www.docker.com/products/docker-desktop/)을 설치한 뒤:

```powershell
curl -o docker-compose.prod.yml https://raw.githubusercontent.com/NoFxAiOS/nofx/main/docker-compose.prod.yml
docker compose -f docker-compose.prod.yml up -d
```

**소스에서 빌드** — Go 1.21+, Node.js 18+:

```bash
git clone https://github.com/NoFxAiOS/nofx.git && cd nofx
go build -o nofx && ./nofx            # backend
cd web && npm install && npm run dev  # frontend, in a second terminal
```

**업데이트** — 설치 스크립트를 다시 실행하면 제자리에서 업그레이드됩니다.

<details>
<summary>서버 배포</summary>

<br/>

**HTTP**

```bash
curl -fsSL https://raw.githubusercontent.com/NoFxAiOS/nofx/main/install.sh | bash
# http://YOUR_IP:3000
```

**Cloudflare를 통한 HTTPS**

1. [Cloudflare](https://dash.cloudflare.com)에 도메인 추가(무료 플랜)
2. A 레코드 → 서버 IP, Proxied 설정
3. SSL/TLS → Flexible
4. `.env`에 `TRANSPORT_ENCRYPTION=true` 설정

</details>

<br/>

## 문서

|                                                         |                                       |
| :------------------------------------------------------ | :------------------------------------ |
| [시작하기](../../getting-started/README.md)       | 배포 및 거래소 API 가이드    |
| [아키텍처](../../architecture/README.md)             | 시스템 설계와 모듈 색인        |
| [전략 모듈](../../architecture/STRATEGY_MODULE.md) | 코인 선정, AI 프롬프트, 실행 |
| [FAQ](../../guides/faq.en.md)                            | 자주 묻는 질문                      |
| [문제 해결](../../guides/TROUBLESHOOTING.md)       | 흔한 문제 진단하기              |

## 커뮤니티

[Telegram](https://t.me/nofx_dev_community) · [Twitter/X](https://x.com/vergex_ai) · [Issues](https://github.com/NoFxAiOS/nofx/issues) · [vergex.trade](https://vergex.trade) · [라이브 대시보드](https://vergex.trade/explore)

## 기여

코드, 문서, 번역, 버그 리포트 모두 환영합니다 — [기여 가이드](../../../CONTRIBUTING.md), [행동 강령](../../../CODE_OF_CONDUCT.md), [보안 정책](../../../SECURITY.md)을 참고하세요.

NOFX는 의미 있는 기여를 기록하며, 생태계가 성장함에 따라 기여자에게 보상할 계획입니다. 우선순위 이슈에는 더 높은 가중치가 부여됩니다.

| 기여 유형      | 가중치 |
| :---------------- | :----: |
| 고정 이슈 PR  | ★★★★★★ |
| 코드(머지된 PR) | ★★★★★  |
| 버그 수정         |  ★★★★  |
| 기능 아이디어     |  ★★★   |
| 버그 리포트       |   ★★   |
| 문서     |   ★★   |

<a href="https://github.com/NoFxAiOS/nofx/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=NoFxAiOS/nofx" alt="Contributors"/>
</a>

## 스폰서

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

[스폰서 되기](https://github.com/sponsors/NoFxAiOS)

<br/>

NOFX가 도움이 되었다면, 스타 하나가 다른 트레이더들이 이 프로젝트를 발견하는 데 큰 힘이 됩니다.

[![Star History Chart](https://star-history.dera.page/svg?repos=NoFxAiOS/nofx&type=Date)](https://star-history.dera.page/#NoFxAiOS/nofx&Date)

## 라이선스

[AGPL-3.0](../../../LICENSE)

<sub>자동매매에는 상당한 위험이 따릅니다. AI 기반 전략은 실험적이며 손실이 발생할 수 있습니다. 포지션 규모를 적절히 관리하고, 각 거래소의 구조를 이해하며, 잃어도 감당할 수 있는 자금으로만 거래하세요. 전체 [면책 조항](../../../DISCLAIMER.md)을 확인하세요.</sub>
