import { connection } from '../database/config';

const debug = require('debug')('database');

/**
 * This makes CRUD and other data related methods available to the entities
 * that will inherit this class
 * @export
 * @class Model
 */
class Model {
  /**
   * @param {Object} schema - an object showing tableName and attributes of an entity
   */
  constructor(schema) {
    this.schema = schema;
    this.connection = connection;
    this.whereConstraints = {};
  }

  /**
   * @returns {Array} - all the records available for an entity
   */
  async getAll() {
    const constraintsExist = Object.keys(this.whereConstraints).length > 0;

    let queryString;
    if (constraintsExist) {
      const whereString = this.getWhereString();
      queryString = `SELECT * FROM ${this.schema.tableName} WHERE ${whereString}`;
    } else {
      queryString = `SELECT * FROM ${this.schema.tableName}`;
    }
    try {
      const resultSet = await this.connection.query(queryString);

      // reset the constraints for other queries
      this.resetConstraints();
      return resultSet.rows;
    } catch (err) {
      debug('ERROR--', err.stack);
      return err.stack;
    }
  }

  /**
   * prepare the whereString
   * @returns {String} - the where String eg "field1" = "value1" AND "field2" = "value2";
   */
  getWhereString() {
    let whereString = '';
    let count = 0;
    for (let attribute in this.whereConstraints) {
      if (attribute) {
        const foundAttribute = this.schema.attributes.find(item => item.name === attribute);
        if (foundAttribute) {
          let value;
          if (foundAttribute.type !== 'integer') {
            value = `'${this.whereConstraints[attribute]}'`;
          } else {
            value = this.whereConstraints[attribute];
          }

          attribute = `"${attribute}"`;
          whereString += `${attribute} = ${value}`;

          // trying to find out if the iteration is the last
          if (count !== Object.keys(this.whereConstraints).length - 1) {
            whereString += ' AND ';
          }
        }
        count += 1;
      }
    }

    debug('WHERE STRING', whereString);

    return whereString;
  }

  /**
   * reset the constraints
   * @returns {Model} - the instance of this Model class facilitating method chainability
   */
  resetConstraints() {
    this.whereConstraints = {};
    return this;
  }

  /**
   * @param {Object} constraints - an object of attributes: values
   * @returns {Model} - the instance of this Model class facilitating method chainability
   */
  where(constraints) {
    for (const attribute in constraints) {
      if (attribute) {
        const foundAttribute = this.schema.attributes.find(item => item.name === attribute);
        if (foundAttribute) {
          this.whereConstraints[attribute] = constraints[attribute];
        }
      }
    }
    return this;
  }

  /**
   * @param {Number} id - the id of the record to be selected
   * @returns {Object} - the selected record
   */
  async findById(id) {
    const query = `SELECT * FROM ${this.schema.tableName} WHERE id = ${id}`;
    try {
      const resultSet = await this.connection.query(query);

      return resultSet.rows[0];
    } catch (err) {
      debug('ERROR--', err.stack);
      return err.stack;
    }
  }

  /**
   * @param {*} attribute - the name of the attribute to be used for selecting record
   * @param {*} value - the value of the attribute
   * @returns {Object} - the selected record
   */
  async findByAttribute(attribute, value) {
    const query = `SELECT * FROM ${this.schema.tableName} WHERE "${attribute}" = '${value}'`;
    try {
      const resultSet = await this.connection.query(query);

      return resultSet.rows[0];
    } catch (err) {
      debug('ERROR--', err.stack);
      return err.stack;
    }
  }

  /**
   * @param {Object} data - an object of attributes: value
   * @returns {Object} - the just created record
   */
  async create(data) {
    const createData = this.prepareCreateData(data);
    const { fieldList, fieldValues } = createData;
    const query = `INSERT INTO ${this.schema.tableName} (${fieldList}) VALUES (${fieldValues}) RETURNING *`;
    try {
      const resultSet = await this.connection.query(query);

      const newRecord = resultSet.rows[0];
      debug('new Record', newRecord);
      return newRecord;
    } catch (err) {
      debug('ERROR--', err.stack);
      return err.stack;
    }
  }

  /**
   * @param {Object} data - object of table fields: values
   * @returns {Object} - object of table fields: values
   */
  prepareCreateData(data) {
    const fieldList = [];
    const fieldValues = [];
    for (let field in data) {
      if (field) {
        const foundAttribute = this.schema.attributes.find(item => item.name === field);
        if (foundAttribute) {
          let value;
          if (foundAttribute.type !== 'integer') {
            value = `'${data[field]}'`;
          } else {
            value = data[field];
          }

          field = `"${field}"`;

          fieldValues.push(value);
          fieldList.push(field);
        }
      }
    }

    const preparedData = { fieldList, fieldValues };
    return preparedData;
  }

  /**
   * @param {Object} data - object of field updates
   * @return {String} - formatted Update "Set" String
   */
  prepareUpdateSet(data) {
    let preparedSetString = 'SET ';
    for (const field in data) {
      if (field) {
        const foundAttribute = this.schema.attributes.find(item => item.name === field);
        if (foundAttribute) {
          let fieldSetString = '';
          if (preparedSetString !== 'SET ') {
            fieldSetString = ', ';
          }
          if (foundAttribute.type !== 'integer') {
            fieldSetString += `"${field}" = '${data[field]}'`;
          } else {
            fieldSetString += `"${field}" = ${data[field]}`;
          }
          preparedSetString += fieldSetString;
        }
      }
    }
    return preparedSetString;
  }

  /**
   * @param {*} id - the id of the record
   * @param {Object} data - object containing field updates for the record
   * @returns {Object} - the updated record
   */
  async update(id, data) {
    const preparedUpdateSet = this.prepareUpdateSet(data);
    const queryString = `UPDATE ${this.schema.tableName} ${preparedUpdateSet} WHERE id = ${id} RETURNING *`;

    try {
      const resultSet = await this.connection.query(queryString);

      const updatedRecord = resultSet.rows[0];
      return updatedRecord;
    } catch (err) {
      debug('ERROR--', err.stack);
      return err.stack;
    }
  }

  /**
   * @param {*} id - the id of the record
   * @returns {Boolean} - success or failure boolean flag
   */
  async delete(id) {
    const queryString = `DELETE FROM ${this.schema.tableName} WHERE id = ${id}`;

    try {
      const result = await this.connection.query(queryString);

      if (result.rowCount === 1) {
        return true;
      }
      return false;
    } catch (err) {
      debug('ERROR--', err.stack);
      return err.stack;
    }
  }
}

export default Model;