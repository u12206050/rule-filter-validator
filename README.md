# The idea

Given a specific scope what is the easiest way to write various rules that be tested against the scope for various reasons

Useful for testing & validation Business Logic stored as json.



# Getting started

`npm install rule-filter-validator`

`validatePayload(filter, payload, [strict = false])`

[View all methods and functions](#methods)

## Examples
```ts
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

```ts
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

### Matching items in a list

```ts
const filter: Filter = {
    _or: [{
        permissions: {
            _$: {
                action: {
                    _eq: 'update',
                },
                collection: {
                    _eq: 'membership',
                },
                fields: {
                    _contains: 'status',
                },
            },
        },
    },
    {
        role: {
            _eq: 'admin',
        },
    }],
};

const scope = {
    role: 'author',
    permissions: [
        {
            action: 'create',
            collection: 'membership',
            fields: ['person', 'status'],
        },
        {
            action: 'read',
            collection: 'membership',
            fields: ['id', 'person', 'status'],
        },
        {action: 'update', collection: 'membership', fields: ['status']},
    ],
};

const canAccess = validatePayload(filter, scope, strict?).length === 0
```

# Methods

- `validatePayload(Filter, Payload, strict?)`

    This is the main function that validates the payload against the filter. It returns an array of errors, if any.

- `invertFilter(Filter)`
 
    Inverts the filter, so that the filter will return the opposite of what it would have returned before.

- `extractFieldFromFilter(Filter, Field, Path?)`

    This extracts the given field from the passed Filter and returns a new Filter object that only contains only the given field and its children, if any.

---

## Special Operands

| Fn | Description | Accepted Types |
| ---- | ----- | ----- |
| _and | All of the specified filters must be true for the expression to be true | array of filters
| _or | At least one of the specified filters must be true for the expression to be true | array of filters
| _$ | Used as an index for array of objects, whereby at least one item must pass the filter for the expression to be true.  | object

## All Operands (Functions)

| Fn | Description | Accepted Types |
| ---- | ----- | ----- |
| _eq | equal to | string, number, boolean
| _neq | not equal to | string, number, boolean
| _contains | contains | string, number
| _ncontains | does not contain | string, number
| _starts_with | starts with | string, number
| _nstarts_with | does not start with | string, number
| _ends_with | ends with | string, number
| _nends_with | does not end with | string, number
| _in | in | string, Array
| _nin | not in | string, Array
| _between | between | string, number, Date
| _nbetween | not between | string, number, Date
| _gt | greater than | string, number, Date
| _gte | greater than or equal to | string, number, Date
| _lt | less than | string, number, Date
| _lte | less than or equal to | string, number, Date
| _null | null = | string, number, boolean, Date, Array
| _nnull | not null = | string, number, boolean, Date, Array
| _empty | empty = | string, Array
| _nempty | not empty = | string, Array
| _submitted | submitted = | string, number, boolean, Date, Array
| _regex | matching regex | string, number, boolean, Date



### _$

Example of using `_$`

Given the following data record:
```ts
const data = {
    colors: [{
        name: 'red',
        hex: '#ff0000',
    }, {
        name: 'green',
        hex: '#00ff00',
    }, {
        name: 'blue',
        hex: '#0000ff',
    }]
};
```

The following filter will pass:
```ts
{
    colors: {
        _$: {
            name: {
                _eq: 'red',
            },
        },
    },
}
```

And the following will fail:
```ts
{
    colors: {
        _$: {
            name: {
                _eq: 'yellow',
            },
        },
    },
}
```

You could also have multiple properties that have to match
```ts
// Will pass
{
    colors: {
        _$: {
            name: {
                _eq: 'red',
            },
            hex: {
                _eq: '#ff0000',
            },
        },
    },
}

// Will fail
{
    colors: {
        _$: {
            name: {
                _eq: 'red',
            },
            hex: {
                _eq: '#ff4444',
            },
        },
    },
};
```