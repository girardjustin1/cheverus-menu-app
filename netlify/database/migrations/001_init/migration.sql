-- Cheverus Lunch Planner: parents, year-long sessions, saved plans, and emails (drafts + sent).

CREATE TABLE users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name   TEXT NOT NULL,
  email       TEXT NOT NULL,
  -- Lower-cased email: one account per address, however it's typed.
  email_key   TEXT NOT NULL UNIQUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Sign-in sessions. Only a SHA-256 hash of the cookie token is stored.
CREATE TABLE sessions (
  token_hash    TEXT PRIMARY KEY,
  user_id       UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at    TIMESTAMPTZ NOT NULL
);
CREATE INDEX sessions_user_id_idx ON sessions (user_id);

-- Everything planned in the app (days, family info, diet, onboarding) as one document per parent.
CREATE TABLE plans (
  user_id     UUID PRIMARY KEY REFERENCES users (id) ON DELETE CASCADE,
  data        JSONB NOT NULL,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Emails to school staff: drafts and sent (copied / opened in Mail).
CREATE TABLE orders (
  id           TEXT PRIMARY KEY,
  user_id      UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  week_monday  DATE NOT NULL,
  -- Set for single-day emails; NULL for weekly ones.
  day          DATE,
  method       TEXT NOT NULL CHECK (method IN ('draft', 'copy', 'mail')),
  body         TEXT NOT NULL,
  sent_at      TIMESTAMPTZ NOT NULL,
  data         JSONB NOT NULL
);
CREATE INDEX orders_user_sent_idx ON orders (user_id, sent_at DESC);
