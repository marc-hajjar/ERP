CREATE DATABASE IF NOT EXISTS achi_erp;
USE achi_erp;

CREATE TABLE IF NOT EXISTS clients (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(150) NOT NULL,
  company     VARCHAR(150),
  email       VARCHAR(150),
  phone       VARCHAR(50),
  address     TEXT,
  city        VARCHAR(100),
  country     VARCHAR(100) DEFAULT 'Lebanon',
  notes       TEXT,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS leads (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(150) NOT NULL,
  company     VARCHAR(150),
  email       VARCHAR(150),
  phone       VARCHAR(50),
  source      VARCHAR(100),
  status      VARCHAR(50) DEFAULT 'new',
  notes       TEXT,
  assigned_to VARCHAR(100),
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS quotations (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  quote_number    VARCHAR(50) UNIQUE NOT NULL,
  client_id       INT,
  lead_id         INT,
  title           VARCHAR(200) NOT NULL,
  description     TEXT,
  amount          DECIMAL(12,2) NOT NULL DEFAULT 0,
  status          VARCHAR(50) DEFAULT 'draft',
  valid_until     DATE,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS communications (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  client_id   INT,
  lead_id     INT,
  type        VARCHAR(50),
  summary     TEXT NOT NULL,
  date        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by  VARCHAR(100),
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS inventory_items (
  id                 INT AUTO_INCREMENT PRIMARY KEY,
  name               VARCHAR(150) NOT NULL,
  category           VARCHAR(100),
  unit               VARCHAR(50),
  quantity_total     INT DEFAULT 0,
  quantity_available INT DEFAULT 0,
  reorder_level      INT DEFAULT 10,
  unit_cost          DECIMAL(10,2) DEFAULT 0,
  location           VARCHAR(100) DEFAULT 'warehouse',
  notes              TEXT,
  created_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS projects (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  project_number  VARCHAR(50) UNIQUE NOT NULL,
  name            VARCHAR(200) NOT NULL,
  client_id       INT,
  quotation_id    INT,
  description     TEXT,
  location        VARCHAR(200),
  status          VARCHAR(50) DEFAULT 'planning',
  start_date      DATE,
  end_date        DATE,
  contract_value  DECIMAL(12,2) DEFAULT 0,
  estimated_cost  DECIMAL(12,2) DEFAULT 0,
  actual_cost     DECIMAL(12,2) DEFAULT 0,
  notes           TEXT,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS workers (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(150) NOT NULL,
  role        VARCHAR(100),
  phone       VARCHAR(50),
  daily_rate  DECIMAL(8,2) DEFAULT 0,
  status      VARCHAR(50) DEFAULT 'available',
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS project_workers (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  project_id  INT,
  worker_id   INT,
  role        VARCHAR(100),
  start_date  DATE,
  end_date    DATE,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (worker_id)  REFERENCES workers(id)  ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS project_materials (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  project_id    INT,
  item_id       INT,
  quantity      INT NOT NULL,
  allocated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  returned_at   TIMESTAMP NULL,
  notes         TEXT,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (item_id)    REFERENCES inventory_items(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS suppliers (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(150) NOT NULL,
  contact     VARCHAR(150),
  email       VARCHAR(150),
  phone       VARCHAR(50),
  address     TEXT,
  category    VARCHAR(100),
  notes       TEXT,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS invoices (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  invoice_number  VARCHAR(50) UNIQUE NOT NULL,
  project_id      INT,
  client_id       INT,
  amount          DECIMAL(12,2) NOT NULL DEFAULT 0,
  tax_amount      DECIMAL(12,2) DEFAULT 0,
  total_amount    DECIMAL(12,2) NOT NULL DEFAULT 0,
  status          VARCHAR(50) DEFAULT 'unpaid',
  issue_date      DATE DEFAULT (CURRENT_DATE),
  due_date        DATE,
  paid_date       DATE,
  notes           TEXT,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL,
  FOREIGN KEY (client_id)  REFERENCES clients(id)  ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS expenses (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  project_id  INT,
  category    VARCHAR(100),
  description VARCHAR(255) NOT NULL,
  amount      DECIMAL(12,2) NOT NULL,
  date        DATE DEFAULT (CURRENT_DATE),
  supplier_id INT,
  receipt_ref VARCHAR(100),
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS payments (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  invoice_id    INT,
  amount        DECIMAL(12,2) NOT NULL,
  payment_date  DATE DEFAULT (CURRENT_DATE),
  method        VARCHAR(50),
  reference     VARCHAR(100),
  notes         TEXT,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
);

INSERT IGNORE INTO inventory_items (name, category, unit, quantity_total, quantity_available, reorder_level, unit_cost) VALUES
('Standard Frame 1.5m', 'frame',  'pcs', 500, 500, 50, 45.00),
('Standard Frame 2m',   'frame',  'pcs', 300, 300, 30, 55.00),
('Wooden Plank Board',  'board',  'pcs', 800, 800, 80, 12.00),
('Swivel Coupler',      'coupler','pcs',1000,1000,100,  3.50),
('Right Angle Coupler', 'coupler','pcs',1200,1200,100,  3.00),
('Base Plate',          'base',   'pcs', 400, 400, 40,  8.00),
('Adjustable Base Jack','base',   'pcs', 200, 200, 20, 15.00),
('Ledger 1.8m',         'ledger', 'pcs', 600, 600, 60, 18.00),
('Diagonal Brace',      'brace',  'pcs', 400, 400, 40, 14.00),
('Toe Board',           'safety', 'pcs', 300, 300, 30, 10.00),
('Safety Net (5x5m)',   'safety', 'pcs',  50,  50,  5, 85.00),
('Stairway Unit',       'access', 'set',  20,  20,  2,250.00);