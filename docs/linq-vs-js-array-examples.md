# LINQ (C#) vs JavaScript/TypeScript Array Methods

So sánh cú pháp và ý nghĩa giữa LINQ trong C# và các method mảng trong TypeScript/JavaScript.

---

## 1. Select → map

**C#:**
```csharp
var doubled = numbers.Select(x => x * 2);
```

**TS:**
```ts
const doubled = numbers.map(x => x * 2);
```

---

## 2. Where → filter

**C#:**
```csharp
var evens = numbers.Where(x => x % 2 == 0);
```

**TS:**
```ts
const evens = numbers.filter(x => x % 2 === 0);
```

---

## 3. FirstOrDefault → find

**C#:**
```csharp
var firstEven = numbers.FirstOrDefault(x => x % 2 == 0);
```

**TS:**
```ts
const firstEven = numbers.find(x => x % 2 === 0);
```

---

## 4. Aggregate → reduce

**C#:**
```csharp
var sum = numbers.Aggregate(0, (acc, x) => acc + x);
```

**TS:**
```ts
const sum = numbers.reduce((acc, x) => acc + x, 0);
```

---

## 5. ForEach

**C#:**
```csharp
numbers.ForEach(x => Console.WriteLine(x));
```

**TS:**
```ts
numbers.forEach(x => console.log(x));
```

---

## 6. Add, AddRange → push / concat

**C#:**
```csharp
list.Add(5);
list.AddRange(new[] {6,7});
```

**TS:**
```ts
arr.push(5);
arr.push(...[6,7]);
// hoặc concat
const newArr = arr.concat([6,7]);
```

---

## 7. Remove, RemoveRange → filter / splice

**C#:**
```csharp
list.Remove(5);
list.RemoveRange(0, 2);
```

**TS:**
```ts
const filtered = arr.filter(x => x !== 5);
arr.splice(0, 2); // xóa 2 phần tử từ index 0
```

---

## 8. Update, UpdateRange → map

**C#:**
```csharp
list.Where(x => x == 5).ToList().ForEach(x => x = 10);
```

**TS:**
```ts
const updated = arr.map(x => x === 5 ? 10 : x);
```

---

## 9. Any

**C#:**
```csharp
bool hasEven = numbers.Any(x => x % 2 == 0);
```

**TS:**
```ts
const hasEven = numbers.some(x => x % 2 === 0);
```

---

## 10. All

**C#:**
```csharp
bool allPositive = numbers.All(x => x > 0);
```

**TS:**
```ts
const allPositive = numbers.every(x => x > 0);
```

---

## 11. Count

**C#:**
```csharp
int countEven = numbers.Count(x => x % 2 == 0);
```

**TS:**
```ts
const countEven = numbers.filter(x => x % 2 === 0).length;
```

---

## 12. Distinct

**C#:**
```csharp
var distinct = numbers.Distinct();
```

**TS:**
```ts
const distinct = [...new Set(numbers)];
```
---

## 9. Any

**C#:**
```csharp
bool hasEven = numbers.Any(x => x % 2 == 0);

**TS:**
```ts
const hasEven = numbers.some(x => x % 2 === 0);
// Ví dụ: [1,2,3] -> true (có số chẵn 2)

---

## 10. All

**C#:**
```csharp
bool allPositive = numbers.All(x => x > 0);

**TS:**
```ts
const allPositive = numbers.every(x => x > 0);

---

## 11. Count

**C#:**
```csharp
int countEven = numbers.Count(x => x % 2 == 0);

**TS:**
```ts
const countEven = numbers.filter(x => x % 2 === 0).length;
// Ví dụ: [1,2,3,4] -> 2 (có 2 số chẵn)

---

## 12. Distinct

**C#:**
```csharp
var distinct = numbers.Distinct();

**TS:**
```ts
const distinct = [...new Set(numbers)];
// Ví dụ: [1,2,2,3,3] -> [1,2,3]

---

