function save_host() {
    var host_input = document.getElementById('host_input');
    var host_nicename_input = document.getElementById('host_nicename_input');

    if (host_input.value == '') {
        setStatus('Cannot save empty host');
        return
    }

    chrome.storage.sync.get({
        host_objects: {}
    }, function(items) {
        items.host_objects[host_nicename_input.value + host_input.value] = {
            hostname: host_input.value,
            nicename: host_nicename_input.value
        }
        chrome.storage.sync.set(items , function() {
            var host_wrapper = appendHost(host_input.value, host_nicename_input.value, document.getElementById('saved_hosts'));
            setStatus('Host Saved');
            host_input.value = '';
            host_nicename_input.value = '';
            var del_elm = host_wrapper.children[2];
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
        host_objects: {}
    }, function(items) {
        d_host_nicename = e.srcElement.previousSibling.innerHTML;
        d_hostname = e.srcElement.previousSibling.previousSibling.innerHTML;
        delete items.host_objects[d_host_nicename + d_hostname];
        chrome.storage.sync.set(items, function() {
            e.srcElement.parentNode.remove();
            setStatus('Host Deleted');
        });

    });
}

function restore_hosts(cb) {
    chrome.storage.sync.get({
        host_objects: {}
    }, function(items) {
        var hosts_box = document.getElementById('saved_hosts');
        for (key in items.host_objects) {
            var host = items.host_objects[key];
            appendHost(host.hostname, host.nicename, hosts_box);
        }
        cb();
    });
}

function appendHost(host_name, nice_name, element) {
    var host_wrapper = document.createElement('div');
    host_wrapper.className = 'host_wrapper';
    var host_line = document.createElement('span');
    var name_line = document.createElement('span');
    host_line.className = 'host';
    host_line.innerHTML = host_name;
    name_line.className = 'host_nicename';
    name_line.innerHTML = nice_name;
    host_wrapper.appendChild(host_line);
    host_wrapper.appendChild(name_line);

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

