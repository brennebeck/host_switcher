// Copyright (c) 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

var HTTP_REGEX = /^http(s)?:\/\//i
/**
 * Get the current URL.
 *
 * @param {function(string)} callback - called when the URL of the current tab
 *   is found.
 **/
function getCurrentTabUrl(callback) {
  // Query filter to be passed to chrome.tabs.query - see
  // https://developer.chrome.com/extensions/tabs#method-query
  var queryInfo = {
    active: true,
    currentWindow: true
  };

  chrome.tabs.query(queryInfo, function(tabs) {
    // chrome.tabs.query invokes the callback with a list of tabs that match the
    // query. When the popup is opened, there is certainly a window and at least
    // one tab, so we can safely assume that |tabs| is a non-empty array.
    // A window can only have one active tab at a time, so the array consists of
    // exactly one tab.
    var tab = tabs[0];

    // A tab is a plain object that provides information about the tab.
    // See https://developer.chrome.com/extensions/tabs#type-Tab
    var url = tab.url;

    // tab.url is only available if the "activeTab" permission is declared.
    // If you want to see the URL of other tabs (e.g. after removing active:true
    // from |queryInfo|), then the "tabs" permission is required to see their
    // "url" properties.
    console.assert(typeof url == 'string', 'tab.url should be a string');

    callback(url, tab);
  });
}

function restore_hosts(cb) {
    chrome.storage.sync.get({
        hosts: []
    }, function(items) {
        var hosts_box = document.getElementById('hosts');
        if (items.hosts.length <= 0) {
            href = document.createElement('a');
            href.href = '#';
            href.innerHTML = 'Options';
            href.addEventListener('click', function(e) {
                chrome.tabs.create({'url': "/options.html" } )
            });
            document.getElementsByTagName('body')[0].appendChild(href);
            return;
        }
        items.hosts.forEach(function(host) {
            cb(appendHost(host, hosts_box));
        });
    });
}

function replace_host(target_host, cb) {
    getCurrentTabUrl(function(url, tab) {
        var target_http_leader = 'http://';
        var source_http_leader = 'http://';
        if (hasHTTP(url)) {
            source_http_leader = HTTP_REGEX.exec(url)[0];
        }
        if (hasHTTP(target_host)) {
            target_http_leader = HTTP_REGEX.exec(target_host)[0];
            target_host = target_host.replace(target_http_leader, '');
        }

        var source_host = url.substring(url.indexOf('/', url.indexOf('/') + 1) + 1,url.indexOf('/', url.indexOf('/') + 2))
        var new_url = url.replace(source_host, target_host);
        new_url = new_url.replace(source_http_leader, target_http_leader);
        cb(new_url, tab);
    });
}

function hasHTTP(host) {
   return HTTP_REGEX.test(host);
}

function appendHost(host_name, element) {
    var host_wrapper = document.createElement('div');
    var host_line = document.createElement('a');
    host_line.href = "#";
    host_line.className = 'host';
    host_line.innerHTML = host_name;
    host_wrapper.appendChild(host_line);

    element.appendChild(host_wrapper);
    return host_wrapper;

}

document.addEventListener('DOMContentLoaded', function() {
  restore_hosts(function(elm) {
      href = elm.children[0];
      href.addEventListener('click', function(e) {
          replace_host(e.srcElement.innerHTML, function(new_url, tab) {
             chrome.tabs.create({url:new_url, index: tab.index + 1});
          });
      });
  })
});

chrome.extension.onRequest.addListener(function(request, sender) {
    chrome.tabs.update(sender.tab.id, {url: request.redirect});
});
