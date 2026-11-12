/**
 * Site Content Loader - The Tanur Heritage
 * Dynamically loads and updates content from data/site-content.json
 * Supports 4-section magazine homepage:
 * 1. Hero Auto-Sliding Posters (Image 1)
 * 2. Magazine / Featured Articles & Most Read (Image 2)
 * 3. Videos Section (2x2 grid + sidebar) (Image 3)
 * 4. Recent Section (Image 4)
 * Plus About, Team, Events, Gallery, Archives, Social, and Footer.
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
      window.tanurSiteData = data;
      applyContent(data);
    })
    .catch(function(err) {
      console.log('Site loader fallback to static HTML:', err.message);
    });

  // Helper to extract YouTube ID
  function getYouTubeId(url) {
    if (!url) return '';
    var m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    return m ? m[1] : '';
  }

  // Global function for video modal playback
  window.openVideoPlayer = function(videoUrl, title) {
    var modalEl = document.getElementById('videoPlayerModal');
    var modalTitle = document.getElementById('videoPlayerModalTitle');
    var embedContainer = document.getElementById('videoPlayerEmbedContainer');
    if (!modalEl || !embedContainer) {
      if (videoUrl) window.open(videoUrl, '_blank');
      return;
    }

    if (modalTitle) modalTitle.textContent = title || 'Tanur Heritage Video';

    var ytId = getYouTubeId(videoUrl);
    if (ytId) {
      embedContainer.innerHTML = '<iframe src="https://www.youtube.com/embed/' + ytId + '?autoplay=1&rel=0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>';
    } else if (videoUrl && (videoUrl.endsWith('.mp4') || videoUrl.endsWith('.webm') || videoUrl.includes('/video/'))) {
      embedContainer.innerHTML = '<video controls autoplay style="width:100%; height:100%;"><source src="' + videoUrl + '" type="video/mp4">Your browser does not support video.</video>';
    } else {
      embedContainer.innerHTML = '<iframe src="' + (videoUrl || 'https://www.youtube.com/@thetanurheritage') + '" allowfullscreen></iframe>';
    }

    var bsModal = new bootstrap.Modal(modalEl);
    bsModal.show();

    modalEl.addEventListener('hidden.bs.modal', function onHidden() {
      embedContainer.innerHTML = '';
      modalEl.removeEventListener('hidden.bs.modal', onHidden);
    });
  };

  function applyContent(data) {

    // ────────────────────────────────────────────────────────────
    // SECTION 1: HERO POSTERS SLIDER (Image 1)
    // ────────────────────────────────────────────────────────────
    var posterWrapper = document.getElementById('poster-swiper-wrapper');
    if (posterWrapper && data.posters && Array.isArray(data.posters) && data.posters.length > 0) {
      var posterHtml = '';
      data.posters.forEach(function(p) {
        if (p.active === false) return;
        var linkOpen = p.link ? '<a href="' + p.link + '" class="poster-slide-wrap">' : '<div class="poster-slide-wrap">';
        var linkClose = p.link ? '</a>' : '</div>';
        posterHtml +=
          '<div class="swiper-slide">' +
            linkOpen +
              '<img src="' + p.image + '" alt="' + (p.title || 'Tanur Heritage Poster') + '" class="poster-slide-img" onerror="this.src=\'assets/img/sub 3.png\'">' +
            linkClose +
          '</div>';
      });

      if (posterHtml) {
        posterWrapper.innerHTML = posterHtml;
        var interval = (data.posterSettings && data.posterSettings.autoSlideInterval) ? data.posterSettings.autoSlideInterval : 4000;
        
        // Initialize Swiper for posters
        if (window.Swiper) {
          if (window.posterSwiperInstance) {
            window.posterSwiperInstance.destroy(true, true);
          }
          window.posterSwiperInstance = new Swiper('#poster-swiper', {
            loop: true,
            speed: 800,
            autoplay: {
              delay: interval,
              disableOnInteraction: false,
              pauseOnMouseEnter: true
            },
            effect: 'slide',
            navigation: {
              nextEl: '.poster-next-btn',
              prevEl: '.poster-prev-btn'
            },
            pagination: {
              el: '.poster-pagination',
              clickable: true
            }
          });
        }
      }
    }

    // ────────────────────────────────────────────────────────────
    // SECTION 2: MAGAZINE / EDITORIAL ARTICLES (Image 2)
    // ────────────────────────────────────────────────────────────
    if (data.magazineFeatured) {
      var mag = data.magazineFeatured;

      // 2A. Top Main Featured Article
      var topMainContainer = document.getElementById('mag-top-main-container');
      if (topMainContainer && mag.topMain) {
        var tm = mag.topMain;
        var tmLink = tm.link || 'articles.html';
        topMainContainer.innerHTML =
          '<div class="mag-top-card">' +
            '<div class="row align-items-center">' +
              '<div class="col-lg-7 col-md-7">' +
                '<span class="category-tag">' + (tm.category || 'FEATURED') + '</span>' +
                '<h2 class="mag-top-title"><a href="' + tmLink + '">' + tm.title + '</a></h2>' +
                '<p class="mag-top-excerpt">' + (tm.excerpt || '') + '</p>' +
                '<div class="mag-byline">' +
                  '<span>' + (tm.author || 'The Tanur Heritage') + '</span>, ' +
                  '<span class="text-muted">' + (tm.time || 'JUST NOW') + '</span>' +
                '</div>' +
              '</div>' +
              '<div class="col-lg-5 col-md-5 mt-3 mt-md-0">' +
                '<div class="mag-top-img-wrap">' +
                  '<a href="' + tmLink + '">' +
                    '<img src="' + tm.image + '" alt="' + tm.title + '" class="mag-top-img" onerror="this.src=\'assets/img/masonry-portfolio/masonry-portfolio-5.jpg\'">' +
                  '</a>' +
                '</div>' +
              '</div>' +
            '</div>' +
          '</div>';
      }

      // 2B. Bottom 3-Card Grid
      var subGridContainer = document.getElementById('mag-subgrid-container');
      if (subGridContainer && mag.gridArticles && Array.isArray(mag.gridArticles)) {
        var subHtml = '';
        mag.gridArticles.forEach(function(art, idx) {
          var aLink = art.link || 'articles.html';
          var delay = (idx + 1) * 80;
          subHtml +=
            '<div class="col-md-4" data-aos="fade-up" data-aos-delay="' + delay + '">' +
              '<div class="mag-sub-card">' +
                '<div class="mag-sub-img-wrap">' +
                  '<a href="' + aLink + '">' +
                    '<img src="' + art.image + '" alt="' + art.title + '" class="mag-sub-img" onerror="this.src=\'assets/img/masonry-portfolio/masonry-portfolio-1.jpg\'">' +
                  '</a>' +
                '</div>' +
                '<span class="category-tag">' + (art.category || 'ARTICLES') + '</span>' +
                '<h4 class="mag-sub-title"><a href="' + aLink + '">' + art.title + '</a></h4>' +
                '<p class="mag-sub-excerpt">' + (art.excerpt || '') + '</p>' +
                '<div class="mag-byline">' +
                  '<span>' + (art.author || 'The Tanur Heritage') + '</span>, ' +
                  '<span class="text-muted">' + (art.time || 'RECENT') + '</span>' +
                '</div>' +
              '</div>' +
            '</div>';
        });
        subGridContainer.innerHTML = subHtml;
      }

      // 2C. Sidebar Highlight (Top Right)
      var sideHighlightContainer = document.getElementById('mag-side-highlight-container');
      if (sideHighlightContainer && mag.sidebarHighlight) {
        var sh = mag.sidebarHighlight;
        sideHighlightContainer.innerHTML =
          '<a href="' + (sh.link || 'articles.html') + '" class="mag-side-highlight">' +
            '<img src="' + sh.image + '" alt="' + sh.title + '" onerror="this.src=\'assets/img/masonry-portfolio/masonry-portfolio-8.jpg\'">' +
            '<div class="mag-side-highlight-overlay">' +
              '<p class="mag-side-highlight-title">' + sh.title + '</p>' +
            '</div>' +
          '</a>';
      }

      // 2D. MOST READ Numbered List
      var mostReadContainer = document.getElementById('mag-most-read-container');
      if (mostReadContainer && mag.mostRead && Array.isArray(mag.mostRead)) {
        var mrHtml = '';
        mag.mostRead.forEach(function(item, idx) {
          var num = idx + 1;
          mrHtml +=
            '<a href="' + (item.link || 'articles.html') + '" class="most-read-item">' +
              '<span class="most-read-badge">' + num + '</span>' +
              '<p class="most-read-title">' + item.title + '</p>' +
            '</a>';
        });
        mostReadContainer.innerHTML = mrHtml;
      }
    }

    // ────────────────────────────────────────────────────────────
    // SECTION 3: VIDEOS SECTION (Image 3)
    // ────────────────────────────────────────────────────────────
    if (data.videos) {
      // 3A. Main 2x2 Grid (4 videos)
      var videoGridContainer = document.getElementById('video-main-grid-container');
      if (videoGridContainer && data.videos.mainGrid && Array.isArray(data.videos.mainGrid)) {
        var vHtml = '';
        data.videos.mainGrid.forEach(function(vid, idx) {
          var vUrl = vid.url || 'https://www.youtube.com/@thetanurheritage';
          var vTitleEscaped = (vid.title || 'Tanur Heritage Video').replace(/'/g, "\\'");
          var delay = (idx + 1) * 100;
          vHtml +=
            '<div class="col-md-6" data-aos="fade-up" data-aos-delay="' + delay + '">' +
              '<div class="video-card-main">' +
                '<div class="video-thumb-wrap" onclick="openVideoPlayer(\'' + vUrl + '\', \'' + vTitleEscaped + '\')">' +
                  '<img src="' + vid.thumbnail + '" alt="' + vid.title + '" class="video-thumb-img" onerror="this.src=\'assets/img/sub 1.png\'">' +
                  (vid.tag ? '<span class="video-brand-tag">' + vid.tag + '</span>' : '') +
                  '<div class="video-play-btn"><i class="bi bi-play-fill"></i></div>' +
                '</div>' +
                '<h4 class="video-main-title" onclick="openVideoPlayer(\'' + vUrl + '\', \'' + vTitleEscaped + '\')">' + vid.title + '</h4>' +
                (vid.author ? '<p class="video-main-author">' + vid.author + '</p>' : '') +
              '</div>' +
            '</div>';
        });
        videoGridContainer.innerHTML = vHtml;
      }

      // 3B. Sidebar Video List
      var videoSideContainer = document.getElementById('video-side-list-container');
      if (videoSideContainer && data.videos.sidebarList && Array.isArray(data.videos.sidebarList)) {
        var vsHtml = '';
        data.videos.sidebarList.forEach(function(v) {
          var vUrl = v.url || 'https://www.youtube.com/@thetanurheritage';
          var vTitleEscaped = (v.title || 'Video').replace(/'/g, "\\'");
          vsHtml +=
            '<div class="video-side-item" onclick="openVideoPlayer(\'' + vUrl + '\', \'' + vTitleEscaped + '\')">' +
              '<div class="video-side-content">' +
                '<div class="video-side-cat">' + (v.category || 'VIDEO') + '</div>' +
                '<h5 class="video-side-title">' + v.title + '</h5>' +
                '<div class="video-side-time">' + (v.time || 'RECENT') + '</div>' +
              '</div>' +
              '<div class="video-side-thumb">' +
                '<img src="' + v.thumbnail + '" alt="' + v.title + '" onerror="this.src=\'assets/img/masonry-portfolio/masonry-portfolio-6.jpg\'">' +
                '<div class="video-play-btn"><i class="bi bi-play-fill"></i></div>' +
              '</div>' +
            '</div>';
        });
        videoSideContainer.innerHTML = vsHtml;
      }
    }

    // ────────────────────────────────────────────────────────────
    // SECTION 4: RECENT SECTION (Image 4)
    // ────────────────────────────────────────────────────────────
    var recentContainer = document.getElementById('recent-cards-container');
    if (recentContainer && data.recentArticles && Array.isArray(data.recentArticles)) {
      var rHtml = '';
      data.recentArticles.forEach(function(rec, idx) {
        var delay = (idx + 1) * 80;
        var rLink = rec.link || 'articles.html';
        var tagsHtml = '';
        if (rec.tags && Array.isArray(rec.tags)) {
          rec.tags.forEach(function(t) {
            tagsHtml += '<span>' + t + '</span> ';
          });
        }
        rHtml +=
          '<div class="col-lg-3 col-md-6" data-aos="fade-up" data-aos-delay="' + delay + '">' +
            '<div class="recent-card">' +
              '<div class="recent-thumb-wrap">' +
                '<a href="' + rLink + '">' +
                  '<img src="' + rec.image + '" alt="' + rec.title + '" class="recent-thumb-img" onerror="this.src=\'assets/img/team/team-2.jpg\'">' +
                '</a>' +
                '<div class="recent-read-badge"><i class="bi bi-book"></i> ' + (rec.readTime || '5 minutes') + '</div>' +
              '</div>' +
              '<span class="category-tag">' + (rec.category || 'UPDATION') + '</span>' +
              '<h4 class="recent-title"><a href="' + rLink + '">' + rec.title + '</a></h4>' +
              '<p class="recent-excerpt">' + (rec.excerpt || '') + '</p>' +
              (tagsHtml ? '<div class="recent-tags">' + tagsHtml + '</div>' : '') +
              '<div class="mag-byline">' +
                '<strong style="color:var(--th-accent);">' + (rec.author || 'The Tanur Heritage') + '</strong>, ' +
                '<span class="text-muted">' + (rec.time || 'JUST NOW') + '</span>' +
              '</div>' +
            '</div>' +
          '</div>';
      });
      recentContainer.innerHTML = rHtml;
    }

    // ────────────────────────────────────────────────────────────
    // EXISTING SECTIONS: ABOUT, TEAM, EVENTS, GALLERY, ARCHIVES, SOCIAL, FOOTER
    // ────────────────────────────────────────────────────────────
    // About Us
    if (data.about) {
      var heading = document.getElementById('about-heading');
      if (heading && data.about.title) heading.textContent = data.about.title;
      var t1 = document.getElementById('about-text-1');
      var t2 = document.getElementById('about-text-2');
      var paras = data.about.paragraphs || [];
      if (t1) t1.textContent = (paras.length > 0 ? paras[0] : (data.about.text1 || ''));
      if (t2) t2.textContent = (paras.length > 1 ? paras[1] : (data.about.text2 || ''));
    }

    // Team
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
      }
    }

    // Events
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
      }
    }

    // Gallery
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
      }
    }

    // Archives
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
      }
    }

    // Social Links
    if (data.social) {
      var socialContainers = document.querySelectorAll('.social-links');
      socialContainers.forEach(function(c) {
        var html = '';
        if (data.social.facebook) html += '<a href="' + data.social.facebook + '" target="_blank" rel="noopener" title="Facebook"><i class="bi bi-facebook"></i></a> ';
        if (data.social.instagram) html += '<a href="' + data.social.instagram + '" target="_blank" rel="noopener" title="Instagram"><i class="bi bi-instagram"></i></a> ';
        if (data.social.youtube) html += '<a href="' + data.social.youtube + '" target="_blank" rel="noopener" title="YouTube"><i class="bi bi-youtube"></i></a> ';
        if (data.social.whatsapp_channel) html += '<a href="' + data.social.whatsapp_channel + '" target="_blank" rel="noopener" title="WhatsApp Channel"><i class="bi bi-whatsapp"></i></a> ';
        if (data.social.whatsapp_group) html += '<a href="' + data.social.whatsapp_group + '" target="_blank" rel="noopener" title="WhatsApp Community"><i class="bi bi-whatsapp"></i></a> ';
        if (html) c.innerHTML = html;
      });
    }

    // Footer Tagline
    if (data.footer && data.footer.tagline) {
      var taglines = document.querySelectorAll('.footer-tagline');
      taglines.forEach(function(el) {
        el.textContent = data.footer.tagline;
      });
    }

    if (window.AOS) AOS.refresh();
  }
})();
