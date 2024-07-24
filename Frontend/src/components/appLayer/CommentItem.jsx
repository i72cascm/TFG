import React from "react";

const CommentItem = ({
    comment,
    userData,
    replyToId,
    setReplyToId,
    handleDeleteComment,
    handlePostComment,
    replyToMessage,
    setReplyToMessage,
    isAdmin
}) => {
    return (
        <div
            key={comment.recipeCommentID}
            className="bg-slate-600 p-3 rounded-md my-2"
        >
            <p className="text-xl text-white">{comment.comment}</p>
            <div className="flex justify-between">
                <p className="text-gray-400 py-1">{comment.userName}</p>
                <div className="flex grid-cols-2 gap-3">
                    {(comment.userName === userData.name || isAdmin === "Admin")&& (
                        <button
                            onClick={() =>
                                handleDeleteComment(comment.recipeCommentID)
                            }
                            className="text-red-500 font-semibold py-1 px-2 rounded"
                        >
                            Delete
                        </button>
                    )}

                    {replyToId === comment.recipeCommentID ? (
                        <button
                            onClick={() => {
                                setReplyToId(null);
                                setReplyToMessage("");
                            }}
                            className="text-slate-300 font-semibold py-1 px-2 rounded"
                        >
                            Cancel
                        </button>
                    ) : (
                        <button
                            onClick={() => {
                                setReplyToId(comment.recipeCommentID);
                                setReplyToMessage("");
                            }}
                            className="text-slate-300 font-semibold py-1 px-2 rounded"
                        >
                            Reply
                        </button>
                    )}
                    <p className="text-gray-400 py-1 px-2">
                        {new Date(comment.createdAt).toLocaleString()}
                    </p>
                </div>
            </div>
            {/*Input que se abre solamente al responder a otro comentario*/}
            {replyToId === comment.recipeCommentID && (
                <div>
                    <textarea
                        placeholder="Add a reply..."
                        className="mt-1 resize-none rounded-md border-[2px] border-zinc-400 p-4 w-full text-slate-800 overflow-auto text-xl"
                        spellCheck="false"
                        autoCorrect="false"
                        value={replyToMessage}
                        rows="2"
                        onChange={(e) => setReplyToMessage(e.target.value)}
                    />
                    <div className="flex justify-end">
                        <button
                            className="mb-4 bg-blue-500 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
                            onClick={() =>
                                handlePostComment(comment.recipeCommentID)
                            }
                        >
                            Post Reply
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CommentItem;
