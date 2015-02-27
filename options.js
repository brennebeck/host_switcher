function save_host() {
    var host_input = document.getElementById('host_input');

    if (host_input.value == '') {
        setStatus('Cannot save empty host');
        return
    }

    chrome.storage.sync.get({
        hosts: []
    }, function(items) {
        items.hosts.push(host_input.value)
        chrome.storage.sync.set({
            hosts: items.hosts
        }, function() {
            var host_wrapper = appendHost(host_input.value, document.getElementById('saved_hosts'));
            setStatus('Host Saved');
            host_input.value = '';
            var del_elm = host_wrapper.children[1];
            del_elm.addEventListener('click', function(e) { delete_host(e) });
        });
    });
}

function setStatus(str) {
    var status = document.getElementById('status');
    status.textContent = str;
    setTimeout(function() {
        status.textContent = '';
    }, 1000);
}

function toArray(obj) {
    var a = [];
    for(var i = 0; i < obj.length; i++) {
        a.push(obj[i]);
    }
    return a;
}

function delete_host(e) {
    chrome.storage.sync.get({
        hosts: []
    }, function(items) {
        d_host = e.srcElement.previousSibling.innerHTML;
        chrome.storage.sync.set({
            hosts: items.hosts.filter(function(host){ return host != d_host && host != null})
        }, function() {
            beh = e;
            e.srcElement.parentNode.remove();
            setStatus('Host Deleted');
        });

    });
}

function restore_hosts(cb) {
    chrome.storage.sync.get({
        hosts: []
    }, function(items) {
        var hosts_box = document.getElementById('saved_hosts');
        items.hosts.forEach(function(host) {
            appendHost(host, hosts_box);
        });
        cb();
    });
}

function appendHost(host_name, element) {
    var host_wrapper = document.createElement('div');
    var host_line = document.createElement('span');
    host_line.className = 'host';
    host_line.innerHTML = host_name;
    host_wrapper.appendChild(host_line);

    var del = document.createElement('a');
    del.href = '#';
    del.innerHTML = 'X';
    del.className = 'delete';
    host_wrapper.appendChild(del);
    element.appendChild(host_wrapper);
    return host_wrapper;
}

document.addEventListener('DOMContentLoaded', function() {
    restore_hosts(function() {
        toArray(document.getElementsByClassName('delete')).map(function(elm) {
            elm.addEventListener('click', function(e) { delete_host(e) });
        });
    });
});
document.getElementById('save').addEventListener('click', save_host);

