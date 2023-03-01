import {Filter, invertFilter, validatePayload} from '../src';
// TODO: Create tests for invert filter function

describe('Advanced multi sub object array test', () => {
  const filter: Filter = {
    _or: [
      {
        permissions: {
          _$: {
            action: {
              _eq: 'update',
            },
            collection: {
              _eq: 'registrations',
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
      },
    ],
  };

  it('Should validate without errors', () => {
    const scope = {
      role: 'author',
      permissions: [
        {
          action: 'create',
          collection: 'registrations',
          fields: ['person', 'event', 'status'],
        },
        {
          action: 'read',
          collection: 'registrations',
          fields: ['id', 'person', 'event', 'status'],
        },
        {action: 'update', collection: 'registrations', fields: ['status']},
      ],
    };

    const errors = validatePayload(filter, scope);

    expect(errors).toHaveLength(0);
  });

  it('Should fail validation', () => {
    const scope = {
      role: 'author',
      permissions: [
        {
          action: 'read',
          collection: 'registrations',
          fields: ['id', 'person', 'event', 'status'],
        },
      ],
    };

    const errors = validatePayload(filter, scope);

    expect(errors).toHaveLength(1);
  });
});
