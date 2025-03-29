-- Create Users Table with UUID user_id
CREATE TABLE IF NOT EXISTS users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    firstname VARCHAR(100) NOT NULL,
    lastname VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Queues Table
CREATE TABLE IF NOT EXISTS queues (
    queue_id SERIAL PRIMARY KEY,
    queue_name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(20) CHECK (status IN ('open', 'closed', 'in progress')) NOT NULL DEFAULT 'open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ensure users table exists before creating queue_entries
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
        RAISE EXCEPTION 'Users table does not exist!';
    END IF;
END $$;

-- Create Queue Entries Table without entry_id
CREATE TABLE IF NOT EXISTS queue_entries (
    queue_id INT REFERENCES queues(queue_id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    position INT NOT NULL,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (queue_id, user_id) -- Composite primary key
);
