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
      // Quietly fall back to default HTML content
      console.log('Site loader using fallback HTML content:', err.message);
    });

  function applyContent(data) {
    // 1. About Section
    if (data.about) {
      var t1 = document.getElementById('about-text-1');
      var t2 = document.getElementById('about-text-2');
      if (t1 && data.about.text1) t1.textContent = data.about.text1;
      if (t2 && data.about.text2) t2.textContent = data.about.text2;
    }

    // 2. Team Section
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

    // 3. Social Links
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

    // 4. Footer Tagline
    if (data.footer && data.footer.tagline) {
      var taglines = document.querySelectorAll('.footer-tagline');
      taglines.forEach(function(el) {
        el.textContent = data.footer.tagline;
      });
    }

    // 5. Gallery
    if (data.gallery && Array.isArray(data.gallery) && data.gallery.length > 0) {
      var galleryGrid = document.getElementById('gallery-grid');
      if (galleryGrid) {
        var galHtml = '';
        data.gallery.forEach(function(item) {
          if (!item.url) return;
          var cat = (item.category || 'event').toLowerCase();
          var cap = item.caption || '';
          var desc = item.description || cap;
          var tag = cat.toUpperCase();
          galHtml +=
            '<a class="gallery-item glightbox" href="' + item.url + '" ' +
               'data-category="' + cat + '" ' +
               'data-glightbox="title: ' + cap.replace(/"/g, '&quot;') + '; description: ' + desc.replace(/"/g, '&quot;') + '">' +
              '<img src="' + item.url + '" alt="' + cap.replace(/"/g, '&quot;') + '" loading="lazy">' +
              '<div class="gallery-item-overlay">' +
                '<div>' +
                  '<span class="overlay-tag">' + tag + '</span><br>' +
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
    }
  }
})();
