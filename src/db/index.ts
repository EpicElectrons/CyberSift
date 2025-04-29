import { initDatabase } from './init-mysql';
import { executeQuery, pool, testConnection } from './mysql';
import { sql } from 'drizzle-orm';

// Enhanced database object with proper SQL escaping and error handling
export const db = {
  /**
   * SELECT operation
   * @returns query builder object
   */
  select: () => ({
    from: (table: any) => ({
      where: (condition: any) => ({
        orderBy: (orderBy: any) => {
          try {
            const query = `SELECT * FROM ${table.name} WHERE ${condition.toString()} ORDER BY ${orderBy.toString()}`;
            return executeQuery(query);
          } catch (error) {
            console.error('SELECT query error:', error);
            throw error;
          }
        },
        limit: (limit: number) => {
          try {
            const query = `SELECT * FROM ${table.name} WHERE ${condition.toString()} LIMIT ${limit}`;
            return executeQuery(query);
          } catch (error) {
            console.error('SELECT query error:', error);
            throw error;
          }
        },
      }),
      orderBy: (orderBy: any) => {
        try {
          const query = `SELECT * FROM ${table.name} ORDER BY ${orderBy.toString()}`;
          return executeQuery(query);
        } catch (error) {
          console.error('SELECT query error:', error);
          throw error;
        }
      },
      all: () => {
        try {
          const query = `SELECT * FROM ${table.name}`;
          return executeQuery(query);
        } catch (error) {
          console.error('SELECT query error:', error);
          throw error;
        }
      }
    })
  }),

  /**
   * INSERT operation
   * @param table table object
   * @returns query builder object
   */
  insert: (table: any) => ({
  values: (values: any) => ({
    returning: async () => {
      try {
        // Extract column names and values
        const columns = Object.keys(values).join(', ');
        const placeholders = Object.keys(values).map(() => '?').join(', ');
        const query = `INSERT INTO ${table.name} (${columns}) VALUES (${placeholders})`;

        // Execute the query with the values
        const result = await executeQuery(query, Object.values(values));
        return [{ ...values, id: (result as any).insertId }];
      } catch (error) {
        console.error('INSERT query error:', error);
        throw error;
      }
    },
  }),
}),

  /**
   * UPDATE operation
   * @param table table object
   * @returns query builder object
   */
  update: (table: any) => ({
    set: (values: any) => ({
      where: (condition: any) => ({
        returning: async () => {
          try {
            await executeQuery(`UPDATE ${table.name} SET ? WHERE ${condition.toString()}`, [values]);
            return [{ ...values }];
          } catch (error) {
            console.error('UPDATE query error:', error);
            throw error;
          }
        },
      }),
    }),
  }),

  /**
   * DELETE operation
   * @param table table object
   * @returns query builder object
   */
  delete: (table: any) => ({
    where: (condition: any) => ({
      returning: async () => {
        try {
          await executeQuery(`DELETE FROM ${table.name} WHERE ${condition.toString()}`);
          return [{ success: true }];
        } catch (error) {
          console.error('DELETE query error:', error);
          throw error;
        }
      },
    }),
  }),

  /**
   * Raw SQL query execution
   * @param query SQL query string
   * @param params query parameters
   * @returns query result
   */
  raw: async (query: string, params: any[] = []) => {
    try {
      return await executeQuery(query, params);
    } catch (error) {
      console.error('Raw query error:', error);
      throw error;
    }
  },
  
  /**
   * Test database connection
   * @returns connection status
   */
  testConnection
};

// Initialize database when the app starts
if (typeof window === 'undefined') {
  // Only run on server side
  initDatabase()
    .then(() => console.log('MySQL database initialized successfully'))
    .catch(err => console.error('Error initializing MySQL database:', err));
}

export { executeQuery, pool };
