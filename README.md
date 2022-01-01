## The idea

Given a specific scope what is the easiest way to write various rules that be tested against the scope for various reasons

Useful for testing Business Logic stored as json.

## Usage

`npm install rule-filter-validator`

`validatePayload(filter, payload, [strict = false])`

### Example
```
const SCOPE = {
    person: {
        id: 1,
        dob: "1998-02-18",
        age: 23,
        active: true,
        gender: 'F'
    }
}

const rule: Filter = {
    "person": {
        "age": {
            "_gt": 18,
            "_lt": 25
        }
    }
} 

let errors = validatePayload(rule, SCOPE);
return ! errors.length // true
```

### Strictness

By default tests are case and type insensitive, meaning:

| Rule | Fn | Scope | Result |
| ---- | ----- | ----- | ------ |
| 1 | _eq | '1' | true
| 'ABC' | _eq | 'abc' | true
| 'zxc3' | _contains | 3 | true
| 'zxc3' | _contains | 'ZXC' | true

Calling `validatePayload(filter, payload, [strict = false])` with strict = true will make the validator to be case and type sensitive.

| Rule | Fn | Scope | Result |
| ---- | ----- | ----- | ------ |
| 1 | _eq | '1' | false
| 'ABC' | _eq | 'abc' | false
| 'zxc3' | _contains | 3 | true
| 'zxc3' | _contains | 'ZXC' | false

**_contains** always compares as strings and is therefore not type sensitive


## Advance Usage

### Find a matching price rule

```
const prices = [
    {
        label: 'Child price'
        price: 100,
        logic: {
            "person": {
                "age": {
                    "_lt": 18
                }
            }
        }
    },
    {
        label: 'Adult price'
        price: 200,
        logic: {
            "person": {
                "age": {
                    "_gte": 18
                }
            }
        }
    }
]

const scope = getUserScope(); // You implement this.

const priceToPay = prices.find(({ price, logic }) => {
    let e = validatePayload(logic, scope)
    return ! e.length
})
```