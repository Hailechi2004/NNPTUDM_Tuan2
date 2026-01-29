// ==================== POSTS FUNCTIONS ====================

// Lấy max ID từ danh sách posts
async function getMaxPostId() {
    try {
        let res = await fetch('http://localhost:3000/posts');
        if (res.ok) {
            let posts = await res.json();
            if (posts.length === 0) return 0;
            let maxId = Math.max(...posts.map(p => parseInt(p.id) || 0));
            return maxId;
        }
    } catch (error) {
        console.log(error);
    }
    return 0;
}

// Lấy dữ liệu posts (bao gồm cả đã xoá mềm)
async function GetData() {
    try {
        let res = await fetch('http://localhost:3000/posts');
        if (res.ok) {
            let posts = await res.json();
            let bodyTable = document.getElementById('body-table');
            bodyTable.innerHTML = '';
            for (const post of posts) {
                bodyTable.innerHTML += convertObjToHTML(post);
            }
        }
    } catch (error) {
        console.log(error);
    }
}

// Lưu post (tạo mới hoặc cập nhật)
async function Save() {
    let id = document.getElementById("id_txt").value;
    let title = document.getElementById("title_txt").value;
    let views = document.getElementById("views_txt").value;

    if (id === "") {
        // Tạo mới - ID tự tăng
        let maxId = await getMaxPostId();
        let newId = (maxId + 1).toString();
        
        let res = await fetch('http://localhost:3000/posts', {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                id: newId,
                title: title,
                views: views,
                isDeleted: false
            })
        });
    } else {
        // Cập nhật
        let getItem = await fetch('http://localhost:3000/posts/' + id);
        if (getItem.ok) {
            let existingPost = await getItem.json();
            let res = await fetch('http://localhost:3000/posts/' + id, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    id: id,
                    title: title,
                    views: views,
                    isDeleted: existingPost.isDeleted || false
                })
            });
        }
    }
    
    ClearPostForm();
    GetData();
    return false;
}

// Hiển thị post (gạch ngang nếu đã xoá mềm)
function convertObjToHTML(post) {
    let style = post.isDeleted ? "text-decoration: line-through; color: gray;" : "";
    let deleteBtn = post.isDeleted 
        ? `<input type='button' value='Restore' onclick='RestorePost("${post.id}")'>`
        : `<input type='button' value='Delete' onclick='DeletePost("${post.id}")'>`;
    
    return `<tr style="${style}">
        <td>${post.id}</td>
        <td>${post.title}</td>
        <td>${post.views}</td>
        <td>
            ${deleteBtn}
            <input type='button' value='Edit' onclick='EditPost("${post.id}")'>
            <input type='button' value='Comments' onclick='LoadComments("${post.id}")'>
        </td>
    </tr>`;
}

// Xoá mềm post (isDeleted = true)
async function DeletePost(id) {
    let getItem = await fetch('http://localhost:3000/posts/' + id);
    if (getItem.ok) {
        let post = await getItem.json();
        let res = await fetch('http://localhost:3000/posts/' + id, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                ...post,
                isDeleted: true
            })
        });
        if (res.ok) {
            GetData();
        }
    }
    return false;
}

// Khôi phục post đã xoá mềm
async function RestorePost(id) {
    let getItem = await fetch('http://localhost:3000/posts/' + id);
    if (getItem.ok) {
        let post = await getItem.json();
        let res = await fetch('http://localhost:3000/posts/' + id, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                ...post,
                isDeleted: false
            })
        });
        if (res.ok) {
            GetData();
        }
    }
    return false;
}

// Chỉnh sửa post
async function EditPost(id) {
    let res = await fetch('http://localhost:3000/posts/' + id);
    if (res.ok) {
        let post = await res.json();
        document.getElementById("id_txt").value = post.id;
        document.getElementById("title_txt").value = post.title;
        document.getElementById("views_txt").value = post.views;
    }
}

// Xoá form post
function ClearPostForm() {
    document.getElementById("id_txt").value = "";
    document.getElementById("title_txt").value = "";
    document.getElementById("views_txt").value = "";
}

// ==================== COMMENTS FUNCTIONS ====================

let currentPostId = null;

// Lấy max ID từ danh sách comments
async function getMaxCommentId() {
    try {
        let res = await fetch('http://localhost:3000/comments');
        if (res.ok) {
            let comments = await res.json();
            if (comments.length === 0) return 0;
            let maxId = Math.max(...comments.map(c => parseInt(c.id) || 0));
            return maxId;
        }
    } catch (error) {
        console.log(error);
    }
    return 0;
}

// Load comments theo postId
async function LoadComments(postId) {
    currentPostId = postId;
    document.getElementById("comment_postId").value = postId;
    document.getElementById("comments-section").style.display = "block";
    
    try {
        let res = await fetch('http://localhost:3000/comments?postId=' + postId);
        if (res.ok) {
            let comments = await res.json();
            let commentBody = document.getElementById('comment-body');
            commentBody.innerHTML = '';
            for (const comment of comments) {
                commentBody.innerHTML += convertCommentToHTML(comment);
            }
        }
    } catch (error) {
        console.log(error);
    }
}

// Hiển thị comment (gạch ngang nếu đã xoá mềm)
function convertCommentToHTML(comment) {
    let style = comment.isDeleted ? "text-decoration: line-through; color: gray;" : "";
    let deleteBtn = comment.isDeleted 
        ? `<input type='button' value='Restore' onclick='RestoreComment("${comment.id}")'>`
        : `<input type='button' value='Delete' onclick='DeleteComment("${comment.id}")'>`;
    
    return `<tr style="${style}">
        <td>${comment.id}</td>
        <td>${comment.text}</td>
        <td>${comment.postId}</td>
        <td>
            ${deleteBtn}
            <input type='button' value='Edit' onclick='EditComment("${comment.id}")'>
        </td>
    </tr>`;
}

// Lưu comment (tạo mới hoặc cập nhật)
async function SaveComment() {
    let id = document.getElementById("comment_id").value;
    let text = document.getElementById("comment_text").value;
    let postId = document.getElementById("comment_postId").value;

    if (id === "") {
        // Tạo mới - ID tự tăng
        let maxId = await getMaxCommentId();
        let newId = (maxId + 1).toString();
        
        let res = await fetch('http://localhost:3000/comments', {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                id: newId,
                text: text,
                postId: postId,
                isDeleted: false
            })
        });
    } else {
        // Cập nhật
        let getItem = await fetch('http://localhost:3000/comments/' + id);
        if (getItem.ok) {
            let existingComment = await getItem.json();
            let res = await fetch('http://localhost:3000/comments/' + id, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    id: id,
                    text: text,
                    postId: postId,
                    isDeleted: existingComment.isDeleted || false
                })
            });
        }
    }
    
    ClearCommentForm();
    LoadComments(currentPostId);
    return false;
}

// Xoá mềm comment
async function DeleteComment(id) {
    let getItem = await fetch('http://localhost:3000/comments/' + id);
    if (getItem.ok) {
        let comment = await getItem.json();
        let res = await fetch('http://localhost:3000/comments/' + id, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                ...comment,
                isDeleted: true
            })
        });
        if (res.ok) {
            LoadComments(currentPostId);
        }
    }
    return false;
}

// Khôi phục comment đã xoá mềm
async function RestoreComment(id) {
    let getItem = await fetch('http://localhost:3000/comments/' + id);
    if (getItem.ok) {
        let comment = await getItem.json();
        let res = await fetch('http://localhost:3000/comments/' + id, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                ...comment,
                isDeleted: false
            })
        });
        if (res.ok) {
            LoadComments(currentPostId);
        }
    }
    return false;
}

// Chỉnh sửa comment
async function EditComment(id) {
    let res = await fetch('http://localhost:3000/comments/' + id);
    if (res.ok) {
        let comment = await res.json();
        document.getElementById("comment_id").value = comment.id;
        document.getElementById("comment_text").value = comment.text;
        document.getElementById("comment_postId").value = comment.postId;
    }
}

// Xoá form comment
function ClearCommentForm() {
    document.getElementById("comment_id").value = "";
    document.getElementById("comment_text").value = "";
}

// Ẩn section comments
function CloseComments() {
    document.getElementById("comments-section").style.display = "none";
    currentPostId = null;
}

// Load dữ liệu khi trang được tải
GetData();
