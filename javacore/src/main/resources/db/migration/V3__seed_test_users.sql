-- Flyway V3 Seed Test Users for testing purposes

INSERT INTO users (id, email, password_hash, name, role)
VALUES 
  (gen_random_uuid(), 'admin@forge.com', '$2b$10$C5YJADsi5hm1mXkNXi8cM.OTGaXfrXpOGDe92tXjeT5UId9Gkg6aS', 'Admin User', 'ADMIN'),
  (gen_random_uuid(), 'user@forge.com', '$2b$10$C5YJADsi5hm1mXkNXi8cM.OTGaXfrXpOGDe92tXjeT5UId9Gkg6aS', 'Test User', 'USER')
ON CONFLICT (email) DO NOTHING;
