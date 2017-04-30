import { camelifyOutKeys, snakeInCamelOut } from '../utilities/functionalUtil.js';
import { omit } from 'ramda';

export default function blogRepo({ knex, commentRepo }) {

  return {
    byId     : camelifyOutKeys(byId),
    byUsername : camelifyOutKeys(byUsername),
    all      : camelifyOutKeys(all),
    create   : snakeInCamelOut(create),
    update   : snakeInCamelOut(update),
    del      : snakeInCamelOut(del)
  };

  async function all(start = 0) {
    const BLOG_LIMIT =  20;
    return await knex('blogs')
      .limit(BLOG_LIMIT)
      .offset(start * BLOG_LIMIT)
      .orderBy('datetime', 'desc');
  }

  async function byUsername(username) {
    return await knex('blogs')
      .where({ username })
      .orderBy('datetime', 'desc');
  }

  async function byId(id) {
    return await knex('blogs')
      .where({ id })
      .first('*')
      .orderBy('datetime', 'desc');
  }

  async function create(params) {
    return (await knex('blogs')
      .insert(params)
      .returning('*')
    )[0];
  }

  async function update(params) {
    return (await knex('blogs')
      .update(omit(['blog_id'], params))
      .where({ id: params.blog_id })
      .returning('*')
    )[0];
  }

  async function del(params) {
    await commentRepo.delByBlogId(params.blog_id);
    return (await knex('blogs')
      .del()
      .where({ id: params.blog_id })
      .returning('*')
    )[0];
  }
}

