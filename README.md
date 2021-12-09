## The idea

Given a specific scope what is the easiest way to write various rules that be tested against the scope for various reasons

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