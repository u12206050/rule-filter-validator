import { Filter, validatePayload } from '../src/index';

describe('Relational filters: _some and _none', () => {
  const scope = {
    categories: [
      { id: 1, name: 'Tech', total: 10 },
      { id: 2, name: 'Recipe', total: 20 },
      { id: 3, name: 'Travel', total: 30 },
    ],
  };

  it('matches when at least one related item satisfies condition using _some', () => {
    const filter: Filter = {
      categories: {
        _some: {
            name: { _eq: 'Recipe' },
            total: { _gt: 10 },
        },
      },
    };

    const errors = validatePayload(filter, scope);
    expect(errors).toHaveLength(0);
  });

  it('fails when none of the related items satisfy condition using _some', () => {
    const filter: Filter = {
      categories: {
        _some: {
            _and: [
                { name: { _eq: 'Recipe' } },
                { total: { _gt: 99 } },
            ],
        },
      },
    };

    const errors = validatePayload(filter, scope);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('matches when none of the related items satisfy condition using _none', () => {
    const filter: Filter = {
      categories: {
        _none: {
          name: { _eq: 'Nonexistent' },
        },
      },
    };

    const errors = validatePayload(filter, scope);
    expect(errors).toHaveLength(0);
  });

  it('fails when at least one related item satisfies condition using _none', () => {
    const filter: Filter = {
      categories: {
        _none: {
          name: { _eq: 'Recipe' },
        },
      },
    };

    const errors = validatePayload(filter, scope);
    expect(errors.length).toBeGreaterThan(0);
  });
});


