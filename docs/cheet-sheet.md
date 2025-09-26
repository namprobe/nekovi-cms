# C# vs TypeScript Cheatsheet

## 1. Biến & Kiểu dữ liệu

**C#**
```csharp
int age = 26;
string name = "Nam";
bool isActive = true;
var auto = "type inference";
```

**TypeScript**
```typescript
let age: number = 26;
let name: string = "Nam";
let isActive: boolean = true;
const auto = "type inference"; // inferred as string
```

👉 Gần như giống nhau, chỉ khác từ khóa `let`/`const`. TypeScript có thêm `const` cho immutable values.

## 2. Mảng & Collections

**C#**
```csharp
List<int> numbers = new List<int> {1, 2, 3};
int[] array = {1, 2, 3};
var dict = new Dictionary<string, int> 
{
    ["key1"] = 1,
    ["key2"] = 2
};
```

**TypeScript**
```typescript
let numbers: number[] = [1, 2, 3];
// hoặc
let numbersGeneric: Array<number> = [1, 2, 3];

// Object như Dictionary
let dict: Record<string, number> = {
  key1: 1,
  key2: 2
};
// hoặc
let dictMap = new Map<string, number>();
```

## 3. Object / DTO

**C#**
```csharp
public class User 
{
    public Guid Id { get; set; }
    public string Name { get; set; }
    public int? Age { get; set; } // nullable
}

// Record (C# 9+)
public record UserRecord(Guid Id, string Name);
```

**TypeScript**
```typescript
interface User {
  id: string;
  name: string;
  age?: number; // optional property
}

// Type alias
type UserType = {
  id: string;
  name: string;
};

const user: User = { id: "123", name: "Nam" };
```

## 4. Enum

**C#**
```csharp
public enum Status 
{
    Active = 1,
    Inactive = 2,
    Pending = 3
}

// String enum (với attributes)
public enum StringStatus 
{
    [EnumMember(Value = "active")]
    Active,
    [EnumMember(Value = "inactive")]  
    Inactive
}
```

**TypeScript**
```typescript
enum Status {
  Active = 1,
  Inactive = 2,
  Pending = 3
}

// String enum
enum StringStatus {
  Active = "active",
  Inactive = "inactive",
  Pending = "pending"
}

// Const enum (compile-time)
const enum Direction {
  Up = "UP",
  Down = "DOWN"
}
```

## 5. Generic

**C#**
```csharp
public class Response<T> 
{
    public bool Success { get; set; }
    public T Data { get; set; }
}

// Generic constraints
public class Repository<T> where T : class, new()
{
    public T Create() => new T();
}
```

**TypeScript**
```typescript
interface Response<T> {
  success: boolean;
  data: T;
}

// Generic constraints
interface Repository<T extends object> {
  create(): T;
}

// Utility types
type Partial<T> = { [P in keyof T]?: T[P] };
type Pick<T, K extends keyof T> = { [P in K]: T[P] };
```

## 6. Function & Methods

**C#**
```csharp
// Method
public int Add(int a, int b) 
{
    return a + b;
}

// Lambda/Arrow function
Func<int, int, int> add = (a, b) => a + b;

// Extension method
public static class StringExtensions 
{
    public static bool IsEmpty(this string str) => string.IsNullOrEmpty(str);
}
```

**TypeScript**
```typescript
// Function declaration
function add(a: number, b: number): number {
  return a + b;
}

// Arrow function
const add = (a: number, b: number): number => a + b;

// Optional parameters
function greet(name: string, age?: number): string {
  return age ? `Hello ${name}, ${age}` : `Hello ${name}`;
}

// Rest parameters
function sum(...numbers: number[]): number {
  return numbers.reduce((a, b) => a + b, 0);
}
```

## 7. Async / Await

**C#**
```csharp
public async Task<string> GetUserAsync() 
{
    await Task.Delay(1000);
    return "Nam";
}

public async Task<List<User>> GetUsersAsync() 
{
    var users = await _repository.GetAllAsync();
    return users.ToList();
}
```

**TypeScript**
```typescript
async function getUser(): Promise<string> {
  await new Promise(res => setTimeout(res, 1000));
  return "Nam";
}

async function getUsers(): Promise<User[]> {
  const response = await fetch('/api/users');
  return response.json();
}

// Promise chaining
const result = await fetch('/api/data')
  .then(res => res.json())
  .then(data => data.users);
```

## 8. LINQ vs Array Methods

**C#**
```csharp
var evens = numbers.Where(x => x % 2 == 0).ToList();
var names = users.Select(u => u.Name).ToList();
var adult = users.FirstOrDefault(u => u.Age >= 18);
var hasActive = users.Any(u => u.IsActive);
var allActive = users.All(u => u.IsActive);
var grouped = users.GroupBy(u => u.Department);
```

**TypeScript**
```typescript
const evens = numbers.filter(x => x % 2 === 0);
const names = users.map(u => u.name);
const adult = users.find(u => u.age >= 18);
const hasActive = users.some(u => u.isActive);
const allActive = users.every(u => u.isActive);

// GroupBy không có built-in, dùng lodash hoặc tự implement
import _ from 'lodash';
const grouped = _.groupBy(users, 'department');
```

## 9. Null Safety

**C#**
```csharp
string? name = null;
Console.WriteLine(name ?? "Guest");

// Null-conditional operators
var length = name?.Length;
var upper = name?.ToUpper();

// Null-forgiving operator
string definitelyNotNull = name!;
```

**TypeScript**
```typescript
let name: string | null = null;
console.log(name ?? "Guest");

// Optional chaining
const length = name?.length;
const upper = name?.toUpperCase();

// Non-null assertion operator
const definitelyNotNull = name!;

// Strict null checks (tsconfig.json)
// "strictNullChecks": true
```

## 10. Error Handling

**C#**
```csharp
try 
{
    var result = await SomeAsyncOperation();
    return result;
}
catch (HttpRequestException ex) 
{
    _logger.LogError(ex, "HTTP request failed");
    throw;
}
catch (Exception ex) 
{
    _logger.LogError(ex, "Unexpected error");
    return default;
}
finally 
{
    // cleanup
}
```

**TypeScript**
```typescript
try {
  const result = await someAsyncOperation();
  return result;
} catch (error) {
  if (error instanceof TypeError) {
    console.error('Type error:', error.message);
  } else if (error instanceof Error) {
    console.error('General error:', error.message);
  } else {
    console.error('Unknown error:', error);
  }
  throw error;
} finally {
  // cleanup
}

// Result pattern alternative
type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E };
```

## 11. Classes & Inheritance

**C#**
```csharp
public abstract class Animal 
{
    public string Name { get; protected set; }
    public abstract void MakeSound();
    
    protected Animal(string name) 
    {
        Name = name;
    }
}

public class Dog : Animal 
{
    public Dog(string name) : base(name) { }
    
    public override void MakeSound() 
    {
        Console.WriteLine("Woof!");
    }
}
```

**TypeScript**
```typescript
abstract class Animal {
  protected name: string;
  
  constructor(name: string) {
    this.name = name;
  }
  
  abstract makeSound(): void;
}

class Dog extends Animal {
  constructor(name: string) {
    super(name);
  }
  
  makeSound(): void {
    console.log("Woof!");
  }
}

// Interface implementation
interface Flyable {
  fly(): void;
}

class Bird extends Animal implements Flyable {
  makeSound(): void {
    console.log("Tweet!");
  }
  
  fly(): void {
    console.log("Flying...");
  }
}
```

## 12. Dependency Injection (Khác biệt lớn)

**C# (ASP.NET Core)**
```csharp
// Startup.cs / Program.cs
services.AddScoped<IUserService, UserService>();
services.AddTransient<IEmailService, EmailService>();
services.AddSingleton<ICacheService, CacheService>();

// Controller
[ApiController]
public class UsersController : ControllerBase 
{
    private readonly IUserService _userService;
    
    public UsersController(IUserService userService) 
    {
        _userService = userService;
    }
}
```

**TypeScript**

*Frontend (React):*
```typescript
// Context API
const UserContext = createContext<UserService | null>(null);

// Custom hook
function useUserService() {
  const service = useContext(UserContext);
  if (!service) throw new Error('UserService not provided');
  return service;
}

// Zustand store
import { create } from 'zustand';

interface UserStore {
  users: User[];
  fetchUsers: () => Promise<void>;
}

export const useUserStore = create<UserStore>((set) => ({
  users: [],
  fetchUsers: async () => {
    const users = await userService.getAll();
    set({ users });
  }
}));
```

*Backend (NestJS):*
```typescript
// Service
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}
}

// Controller
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}
}
```

## 13. Decorators & Attributes

**C#**
```csharp
[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase 
{
    [HttpGet("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<User>> GetUser(int id) 
    {
        // implementation
    }
}

// Custom attribute
public class AuditAttribute : ActionFilterAttribute 
{
    public override void OnActionExecuted(ActionExecutedContext context) 
    {
        // audit logic
    }
}
```

**TypeScript**
```typescript
// NestJS decorators
@Controller('users')
export class UsersController {
  @Get(':id')
  @UseGuards(AuthGuard)
  async getUser(@Param('id') id: string): Promise<User> {
    // implementation
  }
}

// Custom decorator
function Log(target: any, propertyName: string, descriptor: PropertyDescriptor) {
  const method = descriptor.value;
  descriptor.value = function (...args: any[]) {
    console.log(`Calling ${propertyName} with`, args);
    return method.apply(this, args);
  };
}

class Example {
  @Log
  doSomething(arg: string) {
    return `Result: ${arg}`;
  }
}
```

## 14. Pattern Matching & Conditional Types

**C# (Pattern Matching)**
```csharp
// Switch expression (C# 8+)
public string GetStatusMessage(Status status) => status switch 
{
    Status.Active => "User is active",
    Status.Inactive => "User is inactive", 
    Status.Pending => "User is pending",
    _ => "Unknown status"
};

// Pattern matching with conditions
public decimal CalculateDiscount(User user) => user switch 
{
    { Age: >= 65 } => 0.2m,
    { IsStudent: true } => 0.1m,
    { MembershipLevel: "Premium" } => 0.15m,
    _ => 0m
};
```

**TypeScript (Conditional Types)**
```typescript
// Union types with type guards
type Status = 'active' | 'inactive' | 'pending';

function getStatusMessage(status: Status): string {
  switch (status) {
    case 'active':
      return 'User is active';
    case 'inactive':
      return 'User is inactive';
    case 'pending':
      return 'User is pending';
    default:
      const exhaustive: never = status;
      throw new Error(`Unhandled status: ${exhaustive}`);
  }
}

// Conditional types
type ApiResponse<T> = T extends string 
  ? { message: T }
  : T extends number 
  ? { code: T }
  : { data: T };

// Mapped types
type Optional<T> = {
  [K in keyof T]?: T[K];
};

type ReadOnly<T> = {
  readonly [K in keyof T]: T[K];
};
```

## Tóm tắt Điểm Khác Biệt Chính

| Aspect | C# | TypeScript |
|--------|----|---------| 
| **Runtime** | Compiled (.NET Runtime) | Transpiled to JavaScript |
| **Type System** | Nominal typing | Structural typing |
| **Null Safety** | Nullable reference types | Union types với null/undefined |
| **Generics** | Runtime generics | Compile-time only |
| **Inheritance** | Single inheritance + interfaces | Single inheritance + mixins |
| **Package Manager** | NuGet | npm/yarn/pnpm |
| **Deployment** | Self-contained or framework-dependent | Node.js hoặc browser |

## Pro Tips cho C# Developers

1. **Type assertions**: `obj as Type` (C#) ≈ `obj as Type` (TS)
2. **Utility types**: Sử dụng `Partial<T>`, `Required<T>`, `Pick<T, K>` thay vì tự định nghĩa
3. **Strict mode**: Luôn bật `strict: true` trong tsconfig.json
4. **ESLint**: Equivalent của StyleCop/CodeAnalysis trong .NET
5. **Debugging**: Source maps cho debugging, tương tự PDB files