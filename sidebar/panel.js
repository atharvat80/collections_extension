// Restore collection
browser.bookmarks.search({title:"Collections", url:undefined})
    .then(result => {
        var cols = [];
        if (result.length === 0) {
            browser.bookmarks.create({title: "Collections", type: "folder"});
        } else {
            browser.bookmarks.getChildren(result[0].id).then(childNodes => {
                for (child of childNodes){
                    addCol(child.title);
                    toggle(document.getElementById(child.title).children[1]);
                    cols.push([child.id, child.title]);
                }
                restoreLink(cols);
            })
        }
    });

function restoreLink(cols){
    cols.forEach(element => {
        browser.bookmarks.getChildren(element[0])
        .then(links =>  links.forEach(
            link => addLink(link.title, link.url, document.getElementById(element[1]).children[1])
        )) 
    });
}

function addColBookmark(name){
    browser.bookmarks.search({title:"Collections", url:undefined})
    .then(result => {
        if (result.length != 0) {
            browser.bookmarks.create({"parentId":result[0].id, "type": "folder","title":name});
        }
    });
}

function removeColBookmark(name){
    browser.bookmarks.search({title:name, url:undefined})
    .then(result => {
        if (result.length != 0){
            browser.bookmarks.removeTree(result[0].id);
        }
    });
}

function addLinkBookmark(title, url, col){
    browser.bookmarks.search({title:col, url:undefined})
    .then(result => {
        if (result.length != 0){
            browser.bookmarks.create({"parentId":result[0].id, "title": title, "url":url});
        }
    });
}

function removeLinkBookmark(title, url){
    browser.bookmarks.search({title:title, url:url})
    .then(result => {
        if (result.length != 0){
            browser.bookmarks.remove(result[0].id);
        }
    });
}

function addCol(name){
    var new_col = document.getElementById("tempCard").cloneNode(true);
    new_col.childNodes[1].childNodes[1].innerHTML = `<strong>${name}</strong>`;
    new_col.removeAttribute("style");
    new_col.setAttribute('id', name);
    document.getElementById("collections").appendChild(new_col);
    addButtonClick();
    deleteButtonClick();
    hideCol();
}

function addLink(name, url, parent){
    if (parent.innerHTML.includes("Nothing in this collection yet") === true){
        parent.innerHTML = " ";
    }
    parent.innerHTML += `<div style="padding:0 0.5rem 0.5rem 0.5rem"> <a href=${url}>${name}</a> <button class="btn btn-sm btn-link remove-link float-right text-secondary">🞩</btn></div>`;
    removeLinkButtonClick();
};

function addButtonClick(){
    var addButtons = document.getElementsByClassName("add-link");
    for (var i = 1; i < addButtons.length; i++) {
        addButtons[i].onclick = function() {
            toggle(document.getElementById("addLinkDiv"));
            document.getElementById("add-link-btn").onclick = ()=>{
                var title = document.getElementById('add-link-name').value;
                var url = document.getElementById('add-link-url').value;
                addLink(title, url, this.parentNode.parentNode.nextElementSibling);
                addLinkBookmark(title, url, this.parentNode.parentNode.parentNode.id);
                document.getElementById('addLinkForm').reset();
                event.preventDefault();
                toggle(document.getElementById("addLinkDiv"));
            }
        };
    }
}

function deleteButtonClick(){
    var delButtons = document.getElementsByClassName("del-col");
    for (var i = 1; i < delButtons.length; i++) {
        delButtons[i].onclick = function() {
            var col = this.parentNode.parentNode.parentNode;
            removeColBookmark(col.id);
            document.getElementById('collections').removeChild(col);
        };
    }
}

function removeLinkButtonClick(){
    var rmLnkBtns = document.getElementsByClassName('remove-link');
    for (btn of rmLnkBtns){
        btn.onclick = function() {
            var parentCol = this.parentNode.parentNode;
            removeLinkBookmark(this.parentNode.children[0].innerHTML, this.parentNode.children[0].origin)
            parentCol.removeChild(this.parentNode);
            if (parentCol.children.length === 0){
                parentCol.innerHTML = "Nothing in this collection yet";
            }
        }
    }
}

function hideCol(){
    var colns = document.getElementsByClassName("col-name");
    console.log(colns);
    for (var i = 0; i < colns.length; i++) {
        colns[i].onclick = function() {
            toggle(this.parentNode.nextElementSibling);
        }
    }
}

function toggle(element){
    if (element.className.includes("hidden") === true){
        element.className = element.className.replace("hidden", '');
    } else {
        element.className += " hidden"; 
    }
}

document.getElementById('newColForm')
    .addEventListener("submit", function(){
        addCol(document.getElementById("new_col_name").value);
        addColBookmark(document.getElementById("new_col_name").value);
        event.preventDefault();
        document.getElementById('newColForm').reset();
    });

document.getElementById('close-form-btn').addEventListener('click', ()=>{
    document.getElementById('addLinkForm').reset();
    event.preventDefault();
    toggle(document.getElementById("addLinkDiv"))
});