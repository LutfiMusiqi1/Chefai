// Factory Pattern Implementation
// Chosen because Factory provides an interface for creating objects in a superclass,
// but allows subclasses to alter the type of objects that will be created.
// This is useful for creating families of related objects without specifying their concrete classes.

interface Shape {
    draw(): void;
    area(): number;
}

class Circle implements Shape {
    constructor(private radius: number) {}

    draw(): void {
        console.log(`Drawing a circle with radius ${this.radius}`);
    }

    area(): number {
        return Math.PI * this.radius * this.radius;
    }
}

class Rectangle implements Shape {
    constructor(private width: number, private height: number) {}

    draw(): void {
        console.log(`Drawing a rectangle with width ${this.width} and height ${this.height}`);
    }

    area(): number {
        return this.width * this.height;
    }
}

class Triangle implements Shape {
    constructor(private base: number, private height: number) {}

    draw(): void {
        console.log(`Drawing a triangle with base ${this.base} and height ${this.height}`);
    }

    area(): number {
        return (this.base * this.height) / 2;
    }
}

class ShapeFactory {
    public static createShape(type: string, ...args: number[]): Shape {
        switch (type.toLowerCase()) {
            case 'circle':
                if (args.length !== 1) throw new Error('Circle requires 1 argument: radius');
                return new Circle(args[0]);
            case 'rectangle':
                if (args.length !== 2) throw new Error('Rectangle requires 2 arguments: width, height');
                return new Rectangle(args[0], args[1]);
            case 'triangle':
                if (args.length !== 2) throw new Error('Triangle requires 2 arguments: base, height');
                return new Triangle(args[0], args[1]);
            default:
                throw new Error(`Unknown shape type: ${type}`);
        }
    }
}

// Demo
console.log("=== Factory Pattern Demo ===");

try {
    const circle = ShapeFactory.createShape('circle', 5);
    circle.draw();
    console.log(`Circle area: ${circle.area()}`);

    const rectangle = ShapeFactory.createShape('rectangle', 4, 6);
    rectangle.draw();
    console.log(`Rectangle area: ${rectangle.area()}`);

    const triangle = ShapeFactory.createShape('triangle', 3, 4);
    triangle.draw();
    console.log(`Triangle area: ${triangle.area()}`);

    // Try invalid shape
    // const invalid = ShapeFactory.createShape('square'); // This would throw an error
} catch (error) {
    console.error(error);
}