/**
 * Site Content Loader - The Tanur Heritage
 * Dynamically loads and updates content from data/site-content.json
 */
(function() {
  'use strict';

  var DATA_URL = 'data/site-content.json?v=' + Date.now();

  fetch(DATA_URL)
    .then(function(res) {
      if (!res.ok) throw new Error('Status: ' + res.status);
      return res.json();
    })
    .then(function(data) {
      if (!data) return;
      applyContent(data);
    })
    .catch(function(err) {
      console.log('Site loader fallback to static HTML:', err.message);
    });

  function applyContent(data) {
    // 1. About Us / Who We Are Section
    if (data.about) {
      var heading = document.getElementById('about-heading');
      if (heading && data.about.title) heading.textContent = data.about.title;

      var t1 = document.getElementById('about-text-1');
      var t2 = document.getElementById('about-text-2');
      var paras = data.about.paragraphs || [];

      if (t1) {
        t1.textContent = (paras.length > 0 ? paras[0] : (data.about.text1 || ''));
      }
      if (t2) {
        t2.textContent = (paras.length > 1 ? paras[1] : (data.about.text2 || ''));
      }
    }

    // 2. Team Members Section
    if (data.team && Array.isArray(data.team) && data.team.length > 0) {
      var teamContainer = document.getElementById('team-container');
      if (teamContainer) {
        var teamHtml = '';
        data.team.forEach(function(member, idx) {
          var delay = (idx + 1) * 100;
          var photo = member.photo || 'assets/img/team/team-1.jpg';
          var fallbackPhoto = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(member.name || 'Member') + '&size=300&background=ef6603&color=fff';
          teamHtml +=
            '<div class="col-lg-3 col-md-6 d-flex align-items-stretch" data-aos="fade-up" data-aos-delay="' + delay + '">' +
              '<div class="team-member">' +
                '<div class="member-img">' +
                  '<img src="' + photo + '" class="img-fluid" alt="' + (member.name || '') + '" onerror="this.src=\'' + fallbackPhoto + '\'">' +
                '</div>' +
                '<div class="member-info">' +
                  '<h4>' + (member.name || '') + '</h4>' +
                  '<p>' + (member.role || '') + '</p>' +
                '</div>' +
              '</div>' +
            '</div>';
        });
        teamContainer.innerHTML = teamHtml;
        if (window.AOS) AOS.refresh();
      }
    }

    // 3. Our Events Section
    if (data.events && Array.isArray(data.events) && data.events.length > 0) {
      var eventsContainer = document.getElementById('events-container');
      if (eventsContainer) {
        var eventsHtml = '';
        data.events.forEach(function(ev, idx) {
          var delay = ((idx % 3) + 1) * 100;
          var img = ev.image || 'assets/img/sub 1.png';
          var dateBadge = ev.date
            ? '<div class="mb-2"><span class="badge" style="background:#ef6603; font-size:11px; font-weight:600; padding:4px 10px; border-radius:12px;">' + ev.date + '</span></div>'
            : '';
          eventsHtml +=
            '<div class="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay="' + delay + '">' +
              '<div class="service-item position-relative">' +
                '<div class="icon">' +
                  '<img class="iconimg" src="' + img + '" alt="' + (ev.title || 'Event') + '" onerror="this.src=\'assets/img/sub 1.png\'">' +
                '</div>' +
                '<a href="' + (ev.link || 'gallery.html') + '" class="stretched-link">' +
                  '<h3>' + (ev.title || '') + '</h3>' +
                '</a>' +
                dateBadge +
                '<p>' + (ev.description || '') + '</p>' +
              '</div>' +
            '</div>';
        });
        eventsContainer.innerHTML = eventsHtml;
        if (window.AOS) AOS.refresh();
      }
    }

    // 4. Gallery (Folders & Photos)
    var galleryGrid = document.getElementById('gallery-grid');
    var galleryFilterWrap = document.getElementById('gallery-filter-wrap');

    if (galleryFilterWrap && data.galleryFolders && Array.isArray(data.galleryFolders)) {
      var btnHtml = '<button class="gallery-filter-btn active" onclick="filterGallery(\'all\', this)">All Photos</button>';
      data.galleryFolders.forEach(function(f) {
        btnHtml += ' <button class="gallery-filter-btn" onclick="filterGallery(\'' + f.id + '\', this)">' + f.name + '</button>';
      });
      galleryFilterWrap.innerHTML = btnHtml;
    }

    if (galleryGrid && data.gallery && Array.isArray(data.gallery) && data.gallery.length > 0) {
      var galHtml = '';
      data.gallery.forEach(function(item) {
        if (!item.url) return;
        var folder = (item.folder || item.category || 'event').toLowerCase();
        var cap = item.caption || '';
        var desc = item.description || cap;
        var folderName = folder.toUpperCase();
        if (data.galleryFolders) {
          var matched = data.galleryFolders.find(function(f) { return f.id === folder; });
          if (matched) folderName = matched.name.toUpperCase();
        }

        galHtml +=
          '<a class="gallery-item glightbox" href="' + item.url + '" ' +
             'data-category="' + folder + '" ' +
             'data-glightbox="title: ' + cap.replace(/"/g, '&quot;') + '; description: ' + desc.replace(/"/g, '&quot;') + '">' +
            '<img src="' + item.url + '" alt="' + cap.replace(/"/g, '&quot;') + '" loading="lazy">' +
            '<div class="gallery-item-overlay">' +
              '<div>' +
                '<span class="overlay-tag">' + folderName + '</span><br>' +
                '<span class="overlay-caption">' + cap + '</span>' +
              '</div>' +
              '<i class="bi bi-zoom-in overlay-icon ms-auto"></i>' +
            '</div>' +
          '</a>';
      });

      if (galHtml) {
        galleryGrid.innerHTML = galHtml;
        if (window.GLightbox) {
          window.galleryLightbox = GLightbox({ selector: '.glightbox' });
        }
        if (window.AOS) AOS.refresh();
      }
    }

    // 5. Archives (Folders & Photos/Records)
    var archivesGrid = document.getElementById('archives-grid');
    var archiveFilterWrap = document.getElementById('archive-filter-wrap');

    if (archiveFilterWrap && data.archiveFolders && Array.isArray(data.archiveFolders)) {
      var arcBtnHtml = '<button class="archive-filter-btn active" onclick="filterArchives(\'all\', this)">All Archives</button>';
      data.archiveFolders.forEach(function(f) {
        arcBtnHtml += ' <button class="archive-filter-btn" onclick="filterArchives(\'' + f.id + '\', this)">' + f.name + '</button>';
      });
      archiveFilterWrap.innerHTML = arcBtnHtml;
    }

    if (archivesGrid && data.archives && Array.isArray(data.archives) && data.archives.length > 0) {
      var arcHtml = '';
      data.archives.forEach(function(item) {
        if (!item.url) return;
        var folder = (item.folder || 'historical-photos').toLowerCase();
        var title = item.title || item.caption || 'Historical Record';
        var year = item.year || '';
        var desc = item.description || title;
        var folderName = folder.toUpperCase();
        if (data.archiveFolders) {
          var matched = data.archiveFolders.find(function(f) { return f.id === folder; });
          if (matched) folderName = matched.name.toUpperCase();
        }

        arcHtml +=
          '<a class="archive-item glightbox" href="' + item.url + '" ' +
             'data-folder="' + folder + '" ' +
             'data-glightbox="title: ' + title.replace(/"/g, '&quot;') + '; description: ' + desc.replace(/"/g, '&quot;') + '">' +
            '<img src="' + item.url + '" alt="' + title.replace(/"/g, '&quot;') + '" loading="lazy">' +
            '<div class="archive-item-overlay">' +
              '<div>' +
                '<span class="overlay-tag">' + folderName + '</span><br>' +
                '<span class="overlay-title">' + title + '</span>' +
                (year ? '<br><span class="overlay-year">' + year + '</span>' : '') +
              '</div>' +
              '<i class="bi bi-zoom-in overlay-icon ms-auto"></i>' +
            '</div>' +
          '</a>';
      });

      if (arcHtml) {
        archivesGrid.innerHTML = arcHtml;
        if (window.GLightbox) {
          window.archiveLightbox = GLightbox({ selector: '.glightbox' });
        }
        if (window.AOS) AOS.refresh();
      }
    }

    // 6. Social Links
    if (data.social) {
      var socialContainers = document.querySelectorAll('.social-links');
      socialContainers.forEach(function(c) {
        var html = '';
        if (data.social.facebook) {
          html += '<a href="' + data.social.facebook + '" target="_blank" rel="noopener" title="Facebook"><i class="bi bi-facebook"></i></a> ';
        }
        if (data.social.instagram) {
          html += '<a href="' + data.social.instagram + '" target="_blank" rel="noopener" title="Instagram"><i class="bi bi-instagram"></i></a> ';
        }
        if (data.social.youtube) {
          html += '<a href="' + data.social.youtube + '" target="_blank" rel="noopener" title="YouTube"><i class="bi bi-youtube"></i></a> ';
        }
        if (data.social.whatsapp_channel) {
          html += '<a href="' + data.social.whatsapp_channel + '" target="_blank" rel="noopener" title="WhatsApp Channel"><i class="bi bi-whatsapp"></i></a> ';
        }
        if (data.social.whatsapp_group) {
          html += '<a href="' + data.social.whatsapp_group + '" target="_blank" rel="noopener" title="WhatsApp Community"><i class="bi bi-whatsapp"></i></a> ';
        }
        if (html) c.innerHTML = html;
      });
    }

    // 7. Footer Tagline
    if (data.footer && data.footer.tagline) {
      var taglines = document.querySelectorAll('.footer-tagline');
      taglines.forEach(function(el) {
        el.textContent = data.footer.tagline;
      });
    }
  }
})();
