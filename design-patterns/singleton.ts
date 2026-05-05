// Singleton Pattern Implementation
// Chosen because Singleton ensures a class has only one instance and provides a global point of access to it.
// This is useful for managing shared resources like database connections, where multiple instances could cause issues.

class DatabaseConnection {
    private static instance: DatabaseConnection;
    private connectionString: string;

    private constructor(connectionString: string) {
        this.connectionString = connectionString;
        console.log(`Database connection established with: ${this.connectionString}`);
    }

    public static getInstance(connectionString?: string): DatabaseConnection {
        if (!DatabaseConnection.instance) {
            if (!connectionString) {
                throw new Error("Connection string required for first instance");
            }
            DatabaseConnection.instance = new DatabaseConnection(connectionString);
        }
        return DatabaseConnection.instance;
    }

    public connect(): void {
        console.log("Connecting to database...");
    }

    public disconnect(): void {
        console.log("Disconnecting from database...");
    }

    public getConnectionString(): string {
        return this.connectionString;
    }
}

// Demo
console.log("=== Singleton Pattern Demo ===");

try {
    const db1 = DatabaseConnection.getInstance("mongodb://localhost:27017/mydb");
    db1.connect();

    const db2 = DatabaseConnection.getInstance(); // Should return the same instance
    console.log(`db1 === db2: ${db1 === db2}`); // true
    console.log(`Connection string: ${db2.getConnectionString()}`);

    db2.disconnect();
} catch (error) {
    console.error(error);
}