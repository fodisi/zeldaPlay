const Knex = require('knex');
const connection = require('../knexfile');
const { Model } = require('objection');

const makeId = require('../../utils/makeId').makeId;

const knexConnection = Knex(connection);

Model.knex(knexConnection);

class Note extends Model{
  static get tableName() {
    return 'public.note'
  }

  $beforeInsert() {
    this.id = '00N' + makeId(9);
  }
  
  $beforeUpdate(opt, queryContext) {
    this.last_modified = Model.knex(knexConnection).fn.now();
    if(opt.old.id !== this.id) {
      this.id = opt.old.id;
    }
  }
}

module.exports = Note;