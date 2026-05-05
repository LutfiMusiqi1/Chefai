// Observer Pattern Implementation
// Chosen because Observer allows objects to subscribe to events and be notified when they occur.
// This is ideal for decoupling event producers from consumers, enabling extensible notification systems.

interface Observer {
    update(event: string, data?: any): void;
}

class EventEmitter {
    private observers: Observer[] = [];

    public subscribe(observer: Observer): void {
        this.observers.push(observer);
        console.log(`Observer subscribed. Total observers: ${this.observers.length}`);
    }

    public unsubscribe(observer: Observer): void {
        const index = this.observers.indexOf(observer);
        if (index > -1) {
            this.observers.splice(index, 1);
            console.log(`Observer unsubscribed. Total observers: ${this.observers.length}`);
        }
    }

    public notify(event: string, data?: any): void {
        console.log(`Notifying observers about event: ${event}`);
        this.observers.forEach(observer => observer.update(event, data));
    }
}

// Concrete Observers
class EmailNotifier implements Observer {
    update(event: string, data?: any): void {
        console.log(`Email Notifier: Sending email for event '${event}' with data: ${JSON.stringify(data)}`);
    }
}

class SMSNotifier implements Observer {
    update(event: string, data?: any): void {
        console.log(`SMS Notifier: Sending SMS for event '${event}' with data: ${JSON.stringify(data)}`);
    }
}

class LogNotifier implements Observer {
    update(event: string, data?: any): void {
        console.log(`Log Notifier: Logging event '${event}' with data: ${JSON.stringify(data)}`);
    }
}

// Demo
console.log("=== Observer Pattern Demo ===");

const emitter = new EventEmitter();

const emailNotifier = new EmailNotifier();
const smsNotifier = new SMSNotifier();
const logNotifier = new LogNotifier();

// Subscribe observers
emitter.subscribe(emailNotifier);
emitter.subscribe(smsNotifier);
emitter.subscribe(logNotifier);

// Emit events
emitter.notify("user_registered", { userId: 123, email: "user@example.com" });
emitter.notify("order_placed", { orderId: 456, amount: 99.99 });

// Unsubscribe one observer
emitter.unsubscribe(smsNotifier);

// Emit another event
emitter.notify("payment_received", { orderId: 456, amount: 99.99 });