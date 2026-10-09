# Структура проєкту

Цей документ описує правила організації коду в проєкті.

Обов'язкові правила auth, браузерних API-запитів, кешу та SSR визначає [AUTH_FLOW.md](./AUTH_FLOW.md). Тут описано розміщення коду; альтернативний API-підхід не встановлюємо.

## Структура

```text
.
├── docs/
│   └── STRUCTURE.md              # Правила структури та розміщення коду
│
├── public/                       # Статичні файли, доступні напряму з браузера
│
├── src/
│   ├── app/                      # Next.js App Router: routes, layouts, route handlers
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── (auth)/               # Route group для auth-сторінок
│   │   ├── (workspace)/          # Route group основної частини застосунку
│   │   └── api/                  # Next.js Route Handlers
│   │
│   ├── modules/                  # Бізнес-домени / незалежні функціональні області
│   │   └── <module>/
│   │       ├── api/              # Браузерні та server-only API-функції модуля
│   │       ├── components/       # UI, специфічний тільки для цього модуля
│   │       ├── hooks/            # Hooks модуля, зокрема React Query hooks
│   │       ├── schemas/          # Zod-схеми та валідація
│   │       ├── utils/            # Допоміжна логіка конкретного модуля
│   │       │   ├── api/          # Перетворення API-даних
│   │       │   ├── date/         # Робота з датами модуля
│   │       │   └── mappers/      # Mapper-функції
│   │       ├── types/            # Типи модуля
│   │       ├── constants.ts      # Константи модуля
│   │       ├── store.ts          # Стан модуля, якщо потрібен Zustand
│   │       └── index.ts          # Публічний API модуля
│   │
│   ├── components/               # Shared React-компоненти
│   │   ├── ui/                   # Базові UI primitives
│   │   ├── layout/               # Header, sidebar та інші layout-компоненти
│   │   ├── providers/            # React providers
│   │   └── icons/                # Shared icons
│   │
│   ├── lib/                      # Shared технічна та інфраструктурна логіка
│   │   ├── api/                  # Базові API clients та transport layer
│   │   ├── auth/                 # Auth infrastructure
│   │   ├── env/                  # Робота та валідація environment variables
│   │   └── utils/                # Загальні pure utilities
│   │       ├── date/             # Загальні утиліти для дат
│   │       ├── formatters/       # Форматування даних
│   │       ├── mappers/          # Загальні mapper-функції
│   │       ├── numbers/          # Робота з числами
│   │       ├── strings/          # Робота з рядками
│   │       └── validation/       # Загальні validation helpers
│   │
│   ├── hooks/                    # Truly global hooks
│   ├── stores/                   # Truly global state
│   └── types/                    # Truly global/shared types
│
├── tests/                        # E2E / integration tests, коли вони з'являться
│
├── next.config.ts
├── eslint.config.mjs
├── tsconfig.json
├── package.json
└── pnpm-lock.yaml
```

---

## `app`

`app/` — це в першу чергу routing та composition layer Next.js.

Тут повинні знаходитися:

- routes;
- layouts;
- loading states;
- error boundaries;
- route groups;
- Route Handlers;
- інша Next.js-specific route logic.

Бізнес-логіку не кладемо в `app/`, якщо вона належить конкретному domain/module.

Сторінка переважно повинна збирати готові частини з `modules`, `components` та `lib`.

---

## `modules`

`modules/` — основне місце для бізнес-логіки застосунку.

Кожен module представляє окремий domain або велику функціональну область.

Module повинен максимально володіти своїм кодом:

- UI;
- API;
- hooks;
- validation;
- types;
- helpers;
- state.

Якщо код потрібен тільки одному module — він повинен залишатися всередині цього module.

Кількість використань не робить код автоматично shared.

---

## `components`

`components/` містить UI, який не належить конкретному бізнес-домену.

Наприклад:

- UI primitives;
- layout;
- providers;
- icons;
- загальні reusable-компоненти.

`components/` не повинен містити бізнес-логіку конкретного module.

---

## `lib`

`lib/` містить shared технічну та infrastructure logic.

Наприклад:

- API transport;
- authentication infrastructure;
- env configuration;
- framework integrations;
- generic utilities.

`lib/` не повинен знати про конкретні business modules.

### Розміщення BFF API

| Шлях | Відповідальність |
| --- | --- |
| `src/app/api/**/route.ts` | HTTP boundary для браузера |
| `src/lib/api/bff-api.ts` | Браузерний HTTP client `bffApi` для Next `/api/...` |
| `src/lib/api/nest-api.ts` | Server-only HTTP client для NestJS |
| `src/lib/api/`, `src/lib/auth/` | Спільна серверна API/auth infrastructure за конкретної потреби |
| `src/modules/<feature>/api/` | API-функції конкретної функціональності |
| `src/modules/<feature>/hooks/` | React Query hooks відповідної функціональності |

Браузерні та серверні API-функції модуля розміщуємо в окремих файлах. Server-only залежності не потрапляють у клієнтські імпорти або змішані barrel exports. Server Actions не є API-шаром для Nest; правила викликів визначає [AUTH_FLOW.md](./AUTH_FLOW.md).

---

## `hooks`

Глобальні hooks.

Hook не повинен потрапляти сюди тільки тому, що він є hook.

Якщо hook використовується конкретним module — він повинен лежати в:

```text
modules/<module>/hooks/
```

У `src/hooks/` кладемо тільки справді shared hooks.

---

## `stores`

Глобальний application state.

Domain-specific Zustand state повинен залишатися всередині відповідного module.

У `src/stores/` кладемо тільки стан, який справді використовується різними незалежними частинами застосунку.

---

## `types`

Глобальні типи, які не належать конкретному module.

Domain-specific типи повинні залишатися всередині module.

Не переносимо тип у глобальний `types/` тільки тому, що він використовується у декількох файлах одного module.

---

# Правила структури

## 1. Не імпортуємо код напряму між modules

Не робимо:

```text
modules/projects
    ↓
modules/users
```

або:

```text
modules/users
    ↓
modules/projects
```

Якщо код потрібен декільком modules, визначаємо його відповідальність та переносимо у відповідний shared layer:

```text
components/
lib/
hooks/
types/
```

Cross-domain orchestration повинна відбуватися вище — переважно в `app/`.

---

## 2. Module володіє своїм кодом

Не переносимо код у shared layer тільки через повторне використання всередині одного domain.

Якщо компонент використовується в п'яти місцях одного module, він усе одно може залишатися:

```text
modules/<module>/components/
```

Shared означає використання різними незалежними областями застосунку.

---

## 3. Не створюємо великий `utils.ts`

Не складаємо десятки непов'язаних функцій у:

```text
utils.ts
```

При зростанні utilities розділяємо їх за призначенням:

```text
utils/
├── api/
├── date/
├── formatters/
├── mappers/
├── numbers/
├── strings/
└── validation/
```

Те саме правило діє всередині module.

---

## 4. Не створюємо папки наперед

Директорія створюється тоді, коли для неї є код.

Module не зобов'язаний одразу мати:

```text
api/
components/
hooks/
schemas/
types/
utils/
store.ts
```

Якщо module має тільки API та один компонент — цього достатньо.

---

## 5. Код тримаємо якомога ближче до власника

Якщо код використовується тільки однією route — він може знаходитися біля цієї route.

Якщо код належить domain — він знаходиться в `modules/<module>`.

Якщо код справді глобальний — він переходить у shared layer.

---

## 6. Не створюємо `common/`

Не створюємо універсальну папку:

```text
common/
```

Вона швидко перетворюється на місце без чіткої відповідальності.

Код повинен мати конкретного власника:

```text
modules/
components/
lib/
hooks/
types/
```

---

## 7. Не створюємо дублікати shared-коду

Перед створенням helper, type, hook або component перевіряємо, чи вже немає відповідної shared-реалізації.

Але не узагальнюємо код передчасно тільки через зовнішню схожість.

---

## 8. Shared layers не залежать від business modules

Допустимий напрямок:

```text
app
↓
modules
↓
components / lib / hooks / types
```

Не допускаємо:

```text
lib → modules
components → modules
hooks → modules
types → modules
```

Це зменшує coupling і ризик circular dependencies.

---

## 9. Використовуємо `@/` для імпортів між областями

Alias:

```text
@/* → src/*
```

Для переходу між різними частинами застосунку використовуємо абсолютний alias.

Relative imports залишаємо для локально пов'язаних файлів.

Уникаємо глибоких імпортів виду:

```text
../../../../...
```

---

## 10. Структура повинна залишатися передбачуваною

Нове рішення повинно відповідати існуючим правилам.

Не створюємо новий top-level layer, якщо код уже логічно належить:

```text
app/
modules/
components/
lib/
hooks/
stores/
types/
```

## 11. Підфічі всередині module

Якщо функціональність належить конкретному domain, але має достатньо власної логіки, її можна виділити в підфічу:

```text
modules/
└── users/
    ├── api/
    ├── components/
    ├── hooks/
    ├── types/
    ├── utils/
    │
    └── user-profile/
        ├── api/
        ├── components/
        ├── hooks/
        ├── types/
        └── utils/
```

### Основні правила

- Підфіча може мати власні `api/`, `components/`, `hooks/`, `schemas/`, `types/`, `utils/`.
- Код, специфічний тільки для підфічі, залишається всередині неї.
- Код, спільний для кількох підфіч одного module, піднімаємо на рівень батьківського module.
- Не створюємо вкладені підфічі глибше одного рівня без вагомої причини.

### Напрямок імпортів

Підфіча може імпортувати shared-код свого батьківського module:

```text
modules/users/user-profile
→ modules/users/api
→ modules/users/components
→ modules/users/hooks
→ modules/users/types
→ modules/users/utils
```

Це дозволено.

Shared-код батьківського module не повинен залежати від конкретної підфічі:

```text
modules/users/api
→ modules/users/user-profile      ❌

modules/users/utils
→ modules/users/user-profile      ❌

modules/users/types
→ modules/users/user-profile      ❌
```

Composition-рівень module може імпортувати підфічі:

```text
modules/users/users-page.tsx
→ modules/users/user-profile      ✅

modules/users/index.ts
→ modules/users/user-profile      ✅
```

Підфічі не повинні імпортувати одна одну напряму:

```text
user-profile
→ user-settings                   ❌
```
---

> [!IMPORTANT]
> Якщо поточна структура перестає відповідати потребам проєкту — спочатку переглядаємо правило, а після цього синхронно оновлюємо код і цей документ.
