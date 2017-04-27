import {
  InvalidOwnerError,
  InvalidComment,
  InvalidCommentUpdate,
  InvalidCommentDeletion
} from '../lib/errors';
import {
  validate,
  newCommentConstraints,
  modifyCommentConstraints,
  deleteCommentConstraints
} from '../lib/validate';

export default function commentService({ commentRepo }) {

  return { getComment, createComment, updateComment, deleteComment };

  async function getComment(queryConstraints) {
    const { id, blogId, username } = queryConstraints;
    return id       ? await commentRepo.byId(id) :
           blogId   ? await commentRepo.byBlogId(blogId) :
           username ? await commentRepo.byUsername(username) :
                      await commentRepo.all();
  }

  async function createComment(params) {
    validate(newCommentConstraints, params, InvalidComment);
    return await commentRepo.create(params);
  }

  async function updateComment(params) {
    validate(modifyCommentConstraints, params, InvalidCommentUpdate);
    const { commentId, username } = params;
    validateOwnership(commentId, username);
    return await commentRepo.update(params);
  }

  async function deleteComment(params) {
    validate(deleteCommentConstraints, params, InvalidCommentDeletion);
    const { commentId, username } = params;
    const isOwner = validateOwnership(commentId, username);
    if (!isOwner) throw new InvalidOwnerError.errorFn(InvalidOwnerError.message);
    return await commentRepo.del(params);
  }

  // TODO: Move into util or 'src/lib/validate.js'
  //       Wrap throwable logic in new func, so don't have to do it manually
  async function validateOwnership(commentId, username) {
    const blog = await commentRepo.byId(commentId);
    return blog && blog.username === username;
  }
}
