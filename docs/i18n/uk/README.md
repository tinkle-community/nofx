<p align="center"><strong>За підтримки <a href="https://vergex.trade">vergex.trade</a></strong></p>

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
  <a href="../ru/README.md">Русский</a> ·
  <a href="README.md">Українська</a> ·
  <a href="../vi/README.md">Tiếng Việt</a>
</p>

<br/>

NOFX — торговий термінал з відкритим кодом, у якому стратегією є мовна модель. Кожен трейдер працює в безперервному циклі — читає структуру ринку, приймає рішення, виконує його, фіксує хід міркувань — а рантайм на Go обмежує кожен ордер жорсткими ризик-лімітами, які модель не може обійти.

Трейдери компонуються вільно: будь-яка модель, будь-яка з дев'яти бірж, будь-яка стратегія. Запускайте кілька одночасно та порівнюйте їх у публічній таблиці лідерів за реалізованою дохідністю. Усе працює на вашій власній машині; облікові дані бірж зашифровані на диску й ніколи її не покидають.

```bash
curl -fsSL https://raw.githubusercontent.com/NoFxAiOS/nofx/main/install.sh | bash
```

Термінал відкривається за адресою `http://127.0.0.1:3000`.

**Перший запуск**

1. Зареєструйтеся — перший акаунт стає власником інстансу.
2. Пройдіть покроковий запуск: покладіть **$1+ USDC** (мережа Base) у гаманець для оплати AI, який він створить для вас, потім підключіть Hyperliquid і внесіть **$12+ USDC** для торгівлі.
3. Запустіть **Autopilot**. AI сканує ринок кожні кілька хвилин і торгує самостійно; кожне рішення з'являється на дашборді в момент ухвалення. Зупинити його можна будь-коли одним кліком.

<br/>

## Реєстрація на біржах

NOFX безкоштовний і має відкритий код. Відкриття акаунта за партнерськими посиланнями нижче дає знижку на торгові комісії та фінансує подальшу розробку.

| Біржа                                                                                                                      | Статус | Реєстрація зі знижкою на комісії                                                          |
| :---------------------------------------------------------------------------------------------------------------------------- | :----: | :---------------------------------------------------------------------------------- |
| <img src="../../../web/public/exchange-icons/binance.jpg" width="20" height="20" style="vertical-align: middle;"/> **Binance**       |   ✅   | [Реєстрація](https://www.binance.com/join?ref=NOFXENG)                                |
| <img src="../../../web/public/exchange-icons/bybit.png" width="20" height="20" style="vertical-align: middle;"/> **Bybit**           |   ✅   | [Реєстрація](https://partner.bybit.com/b/83856)                                       |
| <img src="../../../web/public/exchange-icons/okx.svg" width="20" height="20" style="vertical-align: middle;"/> **OKX**               |   ✅   | [Реєстрація](https://www.okx.com/join/1865360)                                        |
| <img src="../../../web/public/exchange-icons/hyperliquid.png" width="20" height="20" style="vertical-align: middle;"/> **Hyperliquid** |   ✅   | [Реєстрація](https://app.hyperliquid.xyz/join/AITRADING)                              |
| <img src="../../../web/public/exchange-icons/bitget.svg" width="20" height="20" style="vertical-align: middle;"/> **Bitget**         |   ✅   | [Реєстрація](https://www.bitget.com/referral/register?from=referral&clacCode=c8a43172) |
| <img src="../../../web/public/exchange-icons/kucoin.svg" width="20" height="20" style="vertical-align: middle;"/> **KuCoin**         |   ✅   | [Реєстрація](https://www.kucoin.com/r/broker/CXEV7XKK)                                |
| <img src="../../../web/public/exchange-icons/gate.svg" width="20" height="20" style="vertical-align: middle;"/> **Gate**             |   ✅   | [Реєстрація](https://www.gatenode.xyz/share/VQBGUAxY)                                 |
| <img src="../../../web/public/exchange-icons/aster.svg" width="20" height="20" style="vertical-align: middle;"/> **Aster**           |   ✅   | [Реєстрація](https://www.asterdex.com/en/referral/fdfc0e)                             |
| <img src="../../../web/public/exchange-icons/lighter.png" width="20" height="20" style="vertical-align: middle;"/> **Lighter**       |   ✅   | [Реєстрація](https://app.lighter.xyz/?referral=68151432)                              |

<br/>

## Демо

https://github.com/user-attachments/assets/3310f495-14c5-4586-a1cc-3d32e44aa505

<br/>

## Модель пропонує. Рантайм вирішує.

Рішення базуються на стеку даних [Claw402.ai](https://claw402.ai) · Vergex: живій панелі напрямків для всього ринку, поточному напрямку та його історії для кожного інструмента, теплових картах собівартості й ліквідацій та чистому потоці коштів. NOFX дотримується напрямку панелі; решта даних є контекстом виконання.

Кожен ордер проходить через ліміти, зашиті в код поза досяжністю моделі:

|                          |                                                                                    |
| :----------------------- | :--------------------------------------------------------------------------------- |
| Ліміти позицій           | Максимум одночасних позицій, номінал обмежено часткою від капіталу, одна позиція на символ |
| Обмеження плеча          | Жорсткі стелі застосовуються під час розрахунку розміру ордера, незалежно від запиту моделі |
| Захист на боці біржі     | Стоп-лос і тейк-профіт розміщуються на біржі одразу після кожного входу            |
| Автозакриття за просадкою | Прибуткові позиції, що віддають надто багато від свого піку, закриваються          |
| Обмеження частоти угод   | Мінімальний час утримання, кулдауни на повторний вхід за символом, ліміти входів на цикл і на годину |
| Безпечний режим          | Повторювані збої моделі блокують нові входи, доки модель не відновиться            |
| Передстартова перевірка  | Доступ до моделі, кошти в гаманці, стратегія та баланси бірж перевіряються, перш ніж трейдер зможе стартувати |

Кожне рішення зберігається разом із повним ходом міркувань моделі. Жодної позиції без документального сліду.

<br/>

## Термінал

| | |
| :--- | :--- |
| **Autopilot** | Покроковий запуск: поповнення, підключення, депозит, старт — із серверною передстартовою перевіркою на кожному кроці |
| **Strategy Studio** | Пресети стилів, набори монет, індикатори, плече, впевненість входу, власні промпти |
| **Змагання** | Публічна таблиця лідерів за реалізованою дохідністю; кожен запис прив'язаний до своєї моделі |
| **Дашборд** | Живі позиції, ордери, статистика та обґрунтування кожного рішення |

<details>
<summary>Скріншоти</summary>

<br/>

|                        Огляд                            |                          Графік ринку                           |
| :-----------------------------------------------------: | :-------------------------------------------------------------: |
| <img src="../../../screenshots/dashboard-page.png" width="400"/> | <img src="../../../screenshots/dashboard-market-chart.png" width="400"/> |

|                          Статистика торгівлі                     |                          Історія позицій                            |
| :--------------------------------------------------------------: | :-----------------------------------------------------------------: |
| <img src="../../../screenshots/dashboard-trading-stats.png" width="400"/> | <img src="../../../screenshots/dashboard-position-history.png" width="400"/> |

|                     Редактор стратегій                   |                      Налаштування індикаторів                |
| :------------------------------------------------------: | :----------------------------------------------------------: |
| <img src="../../../screenshots/strategy-studio.png" width="400"/> | <img src="../../../screenshots/strategy-indicators.png" width="400"/> |

|                     Змагання                              |                    Конфігурація                               |
| :-------------------------------------------------------: | :-----------------------------------------------------------: |
| <img src="../../../screenshots/competition-page.png" width="400"/> | <img src="../../../screenshots/config-ai-exchanges.png" width="400"/>  |

</details>

<br/>

## Моделі

Вісім провайдерів із вашими власними ключами — DeepSeek, OpenAI, Claude, Qwen, Gemini, Grok, Kimi, MiniMax — включно з власними ендпоінтами та назвами моделей.

Або взагалі без ключів: [Claw402](https://claw402.ai) тарифікує використання моделей за кожен виклик у USDC через протокол x402. Гаманець у мережі Base замінює всі API-ключі.

| Провайдер | Доступ |
| :------- | :----- |
| **Claw402** | [AI-моделі з оплатою за використання та офіційною знижкою](https://claw402.ai) |

## Ринки

Криптовалютні безстрокові контракти на всіх дев'яти біржах. На Hyperliquid той самий рантайм також торгує токенізованими акціями США, сировинними товарами, індексами, валютами та pre-IPO перпетуалами — TSLA, NVDA, GOLD, SPX, EUR, OPENAI — поряд із криптою.

<br/>

## Архітектура

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

## Встановлення

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

**Windows** — встановіть [Docker Desktop](https://www.docker.com/products/docker-desktop/), потім:

```powershell
curl -o docker-compose.prod.yml https://raw.githubusercontent.com/NoFxAiOS/nofx/main/docker-compose.prod.yml
docker compose -f docker-compose.prod.yml up -d
```

**З вихідного коду** — Go 1.21+, Node.js 18+:

```bash
git clone https://github.com/NoFxAiOS/nofx.git && cd nofx
go build -o nofx && ./nofx            # backend
cd web && npm install && npm run dev  # frontend, in a second terminal
```

**Оновлення** — запустіть інсталяційний скрипт ще раз; він оновить усе на місці.

<details>
<summary>Розгортання на сервері</summary>

<br/>

**HTTP**

```bash
curl -fsSL https://raw.githubusercontent.com/NoFxAiOS/nofx/main/install.sh | bash
# http://YOUR_IP:3000
```

**HTTPS через Cloudflare**

1. Додайте домен у [Cloudflare](https://dash.cloudflare.com) (безкоштовний план)
2. A-запис → IP сервера, проксійований
3. SSL/TLS → Flexible
4. `TRANSPORT_ENCRYPTION=true` у `.env`

</details>

<br/>

## Документація

|                                                         |                                       |
| :------------------------------------------------------ | :------------------------------------ |
| [Початок роботи](../../getting-started/README.md)       | Посібники з розгортання та біржових API |
| [Архітектура](../../architecture/README.md)             | Дизайн системи та індекс модулів      |
| [Модуль стратегій](../../architecture/STRATEGY_MODULE.md) | Вибір монет, AI-промпти, виконання  |
| [FAQ](../../guides/faq.en.md)                           | Поширені запитання                    |
| [Усунення несправностей](../../guides/TROUBLESHOOTING.md) | Діагностика типових проблем         |

## Спільнота

[Telegram](https://t.me/nofx_dev_community) · [Twitter/X](https://x.com/vergex_ai) · [Issues](https://github.com/NoFxAiOS/nofx/issues) · [vergex.trade](https://vergex.trade) · [Живий дашборд](https://vergex.trade/explore)

## Участь у розробці

Код, документація, переклади та звіти про помилки — усе це вітається; див. [Посібник для контриб'юторів](../../../CONTRIBUTING.md), [Кодекс поведінки](../../../CODE_OF_CONDUCT.md) і [Політику безпеки](../../../SECURITY.md).

NOFX відстежує значущі внески й має намір винагороджувати контриб'юторів у міру зростання екосистеми. Пріоритетні issues мають більшу вагу.

| Внесок            | Вага |
| :---------------- | :----: |
| PR до закріплених issues | ★★★★★★ |
| Код (змерджені PR) | ★★★★★  |
| Виправлення багів |  ★★★★  |
| Ідеї функцій      |  ★★★   |
| Звіти про баги    |   ★★   |
| Документація      |   ★★   |

<a href="https://github.com/NoFxAiOS/nofx/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=NoFxAiOS/nofx" alt="Contributors"/>
</a>

## Спонсори

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

[Стати спонсором](https://github.com/sponsors/NoFxAiOS)

<br/>

Якщо NOFX вам корисний, зірка допоможе іншим трейдерам його знайти.

[![Star History Chart](https://star-history.dera.page/svg?repos=NoFxAiOS/nofx&type=Date)](https://star-history.dera.page/#NoFxAiOS/nofx&Date)

## Ліцензія

[AGPL-3.0](../../../LICENSE)

<sub>Автоматизована торгівля пов'язана зі значним ризиком. Стратегії на основі AI експериментальні й можуть втрачати гроші. Обирайте розмір позицій розважливо, розумійте кожен майданчик і ніколи не торгуйте коштами, втрату яких не можете собі дозволити. Повний [дисклеймер](../../../DISCLAIMER.md).</sub>
