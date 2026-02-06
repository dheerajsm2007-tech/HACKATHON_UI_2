// Animate numbers counting up
function animateValue(element, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const value = Math.floor(progress * (end - start) + start);

        // Format number with commas
        if (end >= 1000) {
            element.textContent = (value / 1000).toFixed(1) + 'M';
        } else {
            element.textContent = value.toLocaleString();
        }

        if (progress < 1) {
            window.requestAnimationFrame(step);
        } else {
            if (end >= 1000) {
                element.textContent = (end / 1000).toFixed(1) + 'M';
            } else {
                element.textContent = end.toLocaleString();
            }
        }
    };
    window.requestAnimationFrame(step);
}

// Initialize metric animations
function initMetricAnimations() {
    const metricValues = document.querySelectorAll('.metric-value[data-target]');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.classList.contains('animated')) {
                entry.target.classList.add('animated');
                const target = parseInt(entry.target.getAttribute('data-target'));
                animateValue(entry.target, 0, target, 2000);
            }
        });
    }, { threshold: 0.5 });

    metricValues.forEach(value => observer.observe(value));
}

// Initialize Threat Distribution Chart
function initThreatChart() {
    const ctx = document.getElementById('threatChart');
    if (!ctx) return;

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['DAN Attacks', 'Roleplay', 'Obfuscation', 'Injection'],
            datasets: [{
                data: [0, 0, 0, 0],
                backgroundColor: [
                    '#EF4444',
                    '#F97316',
                    '#EAB308',
                    '#3B82F6'
                ],
                borderWidth: 0,
                hoverOffset: 10
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    titleFont: {
                        family: 'Inter',
                        size: 14,
                        weight: '600'
                    },
                    bodyFont: {
                        family: 'Inter',
                        size: 13
                    },
                    callbacks: {
                        label: function (context) {
                            return context.label + ': ' + context.parsed + '%';
                        }
                    }
                }
            },
            animation: {
                animateRotate: true,
                animateScale: true,
                duration: 1500,
                easing: 'easeOutQuart'
            }
        }
    });
}

// Initialize Latency Chart
function initLatencyChart() {
    const ctx = document.getElementById('latencyChart');
    if (!ctx) return;

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
            datasets: [
                {
                    label: 'Native',
                    data: [0, 0, 0, 0, 0, 0],
                    backgroundColor: '#1E293B',
                    borderRadius: 4,
                    barThickness: 30
                },
                {
                    label: 'Secured',
                    data: [0, 0, 0, 0, 0, 0],
                    backgroundColor: '#3B82F6',
                    borderRadius: 4,
                    barThickness: 30
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        color: '#94A3B8',
                        font: {
                            family: 'Inter',
                            size: 12
                        },
                        usePointStyle: true,
                        padding: 15
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    titleFont: {
                        family: 'Inter',
                        size: 14,
                        weight: '600'
                    },
                    bodyFont: {
                        family: 'Inter',
                        size: 13
                    },
                    callbacks: {
                        label: function (context) {
                            return context.dataset.label + ': ' + context.parsed.y + 'ms';
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: '#64748B',
                        font: {
                            family: 'Inter',
                            size: 11
                        }
                    }
                },
                y: {
                    grid: {
                        color: 'rgba(51, 65, 85, 0.3)',
                        drawBorder: false
                    },
                    ticks: {
                        color: '#64748B',
                        font: {
                            family: 'Inter',
                            size: 11
                        },
                        callback: function (value) {
                            return value + 'ms';
                        }
                    },
                    beginAtZero: true
                }
            },
            animation: {
                duration: 1500,
                easing: 'easeOutQuart'
            }
        }
    });
}

// Create world map heatmap visualization with precise locations
function initHeatmap() {
    const heatmap = document.getElementById('heatmap');
    if (!heatmap) return;

    // Clear any existing content
    heatmap.innerHTML = '';

    const width = heatmap.clientWidth || 600;
    const height = 400;

    // Create SVG with background
    const svg = d3.select(heatmap)
        .append('svg')
        .attr('width', '100%')
        .attr('height', height)
        .attr('viewBox', `0 0 ${width} ${height}`)
        .style('background', '#0F172A');

    // Add ocean/background
    svg.append('rect')
        .attr('width', width)
        .attr('height', height)
        .attr('fill', '#0F172A');

    // Projection for world map
    const projection = d3.geoMercator()
        .scale(width / 6.5)
        .translate([width / 2, height / 1.5])
        .center([0, 20]);

    const path = d3.geoPath().projection(projection);

    // Attack data with precise coordinates (longitude, latitude)
    // Note: D3 uses [longitude, latitude] format
    const attackData = {
        'Russia': { intensity: 0.9, percentage: 24, coords: [37.6173, 55.7558], altNames: ['Russian Federation'] }, // Moscow
        'China': { intensity: 0.7, percentage: 18, coords: [116.4074, 39.9042], altNames: ['People\'s Republic of China'] }, // Beijing
        'Brazil': { intensity: 0.5, percentage: 12, coords: [-46.6333, -23.5505] }, // São Paulo
        'United States': { intensity: 0.4, percentage: 8, coords: [-74.0060, 40.7128], altNames: ['United States of America', 'USA'] }, // New York
        'India': { intensity: 0.3, percentage: 6, coords: [77.2090, 28.6139] }, // New Delhi
        'Germany': { intensity: 0.6, percentage: 5, coords: [13.4050, 52.5200] }, // Berlin
        'United Kingdom': { intensity: 0.5, percentage: 4, coords: [-0.1278, 51.5074], altNames: ['UK', 'Great Britain'] }, // London
        'Japan': { intensity: 0.4, percentage: 3, coords: [139.6503, 35.6762] }, // Tokyo
        'South Korea': { intensity: 0.3, percentage: 2, coords: [126.9780, 37.5665], altNames: ['Korea', 'Republic of Korea'] }, // Seoul
        'France': { intensity: 0.4, percentage: 2, coords: [2.3522, 48.8566] } // Paris
    };

    // Helper function to match country names
    function matchCountry(countryName) {
        if (!countryName) return null;
        countryName = countryName.toLowerCase().trim();

        // More comprehensive matching
        const countryMap = {
            'russia': 'Russia',
            'russian federation': 'Russia',
            'china': 'China',
            'peoples republic of china': 'China',
            'brazil': 'Brazil',
            'united states': 'United States',
            'united states of america': 'United States',
            'usa': 'United States',
            'us': 'United States',
            'india': 'India',
            'germany': 'Germany',
            'united kingdom': 'United Kingdom',
            'uk': 'United Kingdom',
            'great britain': 'United Kingdom',
            'japan': 'Japan',
            'south korea': 'South Korea',
            'korea': 'South Korea',
            'republic of korea': 'South Korea',
            'france': 'France'
        };

        // Direct match
        if (countryMap[countryName]) {
            return attackData[countryMap[countryName]];
        }

        // Partial match
        for (const [key, value] of Object.entries(attackData)) {
            const keyLower = key.toLowerCase();
            if (countryName.includes(keyLower) || keyLower.includes(countryName)) {
                return value;
            }
            if (value.altNames) {
                for (const altName of value.altNames) {
                    const altLower = altName.toLowerCase();
                    if (countryName.includes(altLower) || altLower.includes(countryName)) {
                        return value;
                    }
                }
            }
        }
        return null;
    }

    // Load world map data - using multiple fallback sources
    const mapSources = [
        'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json',
        'https://unpkg.com/world-atlas@2/countries-110m.json'
    ];

    let mapLoaded = false;

    function loadMap(sourceIndex = 0) {
        if (sourceIndex >= mapSources.length) {
            // All sources failed, use fallback
            createFallbackMap(svg, width, height, projection, attackData);
            return;
        }

        d3.json(mapSources[sourceIndex])
            .then(world => {
                if (mapLoaded) return; // Already loaded
                mapLoaded = true;

                const countries = topojson.feature(world, world.objects.countries);

                // Debug: Log first country to check property structure
                if (countries.features.length > 0) {
                    console.log('Sample country properties:', countries.features[0].properties);
                }

                // Draw countries
                svg.selectAll('.country')
                    .data(countries.features)
                    .enter()
                    .append('path')
                    .attr('class', 'country')
                    .attr('d', path)
                    .attr('fill', d => {
                        // Try multiple property names (TopoJSON files vary)
                        const countryName = d.properties.NAME || d.properties.name || d.properties.NAME_LONG || d.properties.NAME_EN || '';
                        const matched = matchCountry(countryName);

                        if (matched) {
                            const intensity = matched.intensity;
                            // More vibrant colors for better visibility
                            if (intensity > 0.7) return '#EF4444'; // Red
                            if (intensity > 0.5) return '#F97316'; // Orange
                            if (intensity > 0.3) return '#EAB308'; // Yellow
                            return '#10B981'; // Green
                        }
                        // Lighter default color so countries are visible
                        return '#2D3748'; // Dark grey (lighter than before)
                    })
                    .attr('stroke', '#475569')
                    .attr('stroke-width', 0.5)
                    .attr('opacity', d => {
                        const countryName = d.properties.NAME || d.properties.name || d.properties.NAME_LONG || d.properties.NAME_EN || '';
                        const matched = matchCountry(countryName);
                        if (matched) {
                            // Higher opacity for better visibility
                            return Math.max(matched.intensity * 0.8 + 0.4, 0.6);
                        }
                        return 0.4; // Higher default opacity
                    })
                    .style('cursor', 'pointer')
                    .on('mouseenter', function (event, d) {
                        d3.select(this)
                            .attr('opacity', 1)
                            .attr('stroke-width', 2)
                            .attr('stroke', '#FFFFFF');
                    })
                    .on('mouseleave', function (event, d) {
                        const countryName = d.properties.NAME || d.properties.name || d.properties.NAME_LONG || d.properties.NAME_EN || '';
                        const matched = matchCountry(countryName);
                        const opacity = matched ? Math.max(matched.intensity * 0.8 + 0.4, 0.6) : 0.4;
                        d3.select(this)
                            .attr('opacity', opacity)
                            .attr('stroke-width', 0.5)
                            .attr('stroke', '#475569');
                    });

                // Add heatmap overlays (colored circles) on top of countries for better visibility
                Object.entries(attackData).forEach(([country, data]) => {
                    const [longitude, latitude] = data.coords;
                    const [x, y] = projection([longitude, latitude]);

                    if (x && y && !isNaN(x) && !isNaN(y)) {
                        // Create heatmap gradient circles based on intensity
                        const radius = data.intensity > 0.7 ? 80 : data.intensity > 0.5 ? 60 : data.intensity > 0.3 ? 40 : 30;
                        const color = data.intensity > 0.7 ? '#EF4444' : data.intensity > 0.5 ? '#F97316' : '#EAB308';

                        // Outer glow circle
                        const glowCircle = svg.append('circle')
                            .attr('cx', x)
                            .attr('cy', y)
                            .attr('r', radius)
                            .attr('fill', color)
                            .attr('opacity', data.intensity * 0.15)
                            .style('pointer-events', 'none');

                        // Middle circle
                        const middleCircle = svg.append('circle')
                            .attr('cx', x)
                            .attr('cy', y)
                            .attr('r', radius * 0.6)
                            .attr('fill', color)
                            .attr('opacity', data.intensity * 0.25)
                            .style('pointer-events', 'none');

                        // Inner circle
                        const innerCircle = svg.append('circle')
                            .attr('cx', x)
                            .attr('cy', y)
                            .attr('r', radius * 0.3)
                            .attr('fill', color)
                            .attr('opacity', data.intensity * 0.4)
                            .style('pointer-events', 'none');

                        // Add pulsing circle for high-intensity attacks
                        if (data.intensity > 0.6) {
                            const pulseCircle = svg.append('circle')
                                .attr('cx', x)
                                .attr('cy', y)
                                .attr('r', 20)
                                .attr('fill', data.intensity > 0.7 ? '#EF4444' : '#F97316')
                                .attr('opacity', 0.4)
                                .style('animation', 'pulse 2s infinite')
                                .style('pointer-events', 'none');
                        }

                        // Main marker circle (on top)
                        const marker = svg.append('circle')
                            .attr('cx', x)
                            .attr('cy', y)
                            .attr('r', data.intensity > 0.7 ? 10 : data.intensity > 0.5 ? 8 : 6)
                            .attr('fill', color)
                            .attr('stroke', '#FFFFFF')
                            .attr('stroke-width', 2)
                            .style('cursor', 'pointer')
                            .style('opacity', 0)
                            .transition()
                            .duration(800)
                            .delay(Object.keys(attackData).indexOf(country) * 100)
                            .style('opacity', 1);

                        // Add hover tooltip
                        marker.append('title')
                            .text(`${country}: ${data.percentage}%`);

                        marker.on('mouseenter', function () {
                            d3.select(this)
                                .attr('r', (data.intensity > 0.7 ? 10 : data.intensity > 0.5 ? 8 : 6) * 1.5)
                                .attr('stroke-width', 3);
                        })
                            .on('mouseleave', function () {
                                d3.select(this)
                                    .attr('r', data.intensity > 0.7 ? 10 : data.intensity > 0.5 ? 8 : 6)
                                    .attr('stroke-width', 2);
                            });
                    }
                });
            })
            .catch(error => {
                console.warn(`Failed to load map from ${mapSources[sourceIndex]}, trying next source...`);
                loadMap(sourceIndex + 1);
            });
    }

    loadMap();
}

// Fallback map creation if TopoJSON fails to load
function createFallbackMap(svg, width, height, projection, attackData) {
    // Create a simplified world map background
    svg.append('rect')
        .attr('width', width)
        .attr('height', height)
        .attr('fill', '#0F172A');

    // Use a simple world map SVG path (simplified Mercator projection representation)
    // This is a very basic outline - in production, you'd want a proper SVG world map
    const worldOutline = svg.append('g').attr('class', 'world-outline');

    // Add a note that the full map is loading
    svg.append('text')
        .attr('x', width / 2)
        .attr('y', height / 2)
        .attr('text-anchor', 'middle')
        .attr('fill', '#64748B')
        .attr('font-size', '14px')
        .attr('font-family', 'Inter')
        .text('Loading world map...');

    // Add precise location markers using the projection
    Object.entries(attackData).forEach(([country, data], index) => {
        const [longitude, latitude] = data.coords;
        const [x, y] = projection([longitude, latitude]);

        if (x && y && !isNaN(x) && !isNaN(y) && x > 0 && x < width && y > 0 && y < height) {
            // Add pulsing circle for high-intensity attacks
            if (data.intensity > 0.6) {
                svg.append('circle')
                    .attr('cx', x)
                    .attr('cy', y)
                    .attr('r', 15)
                    .attr('fill', data.intensity > 0.7 ? '#EF4444' : '#F97316')
                    .attr('opacity', 0.3)
                    .style('animation', 'pulse 2s infinite');
            }

            // Main marker circle
            const marker = svg.append('circle')
                .attr('cx', x)
                .attr('cy', y)
                .attr('r', data.intensity > 0.7 ? 8 : data.intensity > 0.5 ? 6 : 4)
                .attr('fill', data.intensity > 0.7 ? '#EF4444' : data.intensity > 0.5 ? '#F97316' : '#EAB308')
                .attr('stroke', '#FFFFFF')
                .attr('stroke-width', 2)
                .style('cursor', 'pointer')
                .style('opacity', 0)
                .transition()
                .duration(800)
                .delay(index * 100)
                .style('opacity', 1);

            // Add hover tooltip
            marker.append('title')
                .text(`${country}: ${data.percentage}%`);

            marker.on('mouseenter', function () {
                d3.select(this)
                    .attr('r', (data.intensity > 0.7 ? 8 : data.intensity > 0.5 ? 6 : 4) * 1.5)
                    .attr('stroke-width', 3);
            })
                .on('mouseleave', function () {
                    d3.select(this)
                        .attr('r', data.intensity > 0.7 ? 8 : data.intensity > 0.5 ? 6 : 4)
                        .attr('stroke-width', 2);
                });
        }
    });
}

// Initialize incidents table
function initIncidentsTable() {
    const incidentsBody = document.getElementById('incidentsBody');
    if (!incidentsBody) return;

    const incidents = [
        { severity: 'high', type: 'DAN Jailbreak', timestamp: '2026-02-05 22:15:32', action: 'blocked' },
        { severity: 'medium', type: 'Prompt Injection', timestamp: '2026-02-05 22:14:18', action: 'blocked' },
        { severity: 'high', type: 'PII Leakage Attempt', timestamp: '2026-02-05 22:12:45', action: 'sanitized' },
        { severity: 'low', type: 'System Prompt Leak', timestamp: '2026-02-05 22:10:22', action: 'blocked' },
        { severity: 'medium', type: 'Obfuscated Payload', timestamp: '2026-02-05 22:08:57', action: 'sanitized' },
        { severity: 'high', type: 'Roleplay Bypass', timestamp: '2026-02-05 22:05:33', action: 'blocked' },
        { severity: 'low', type: 'Jailbreak Attempt', timestamp: '2026-02-05 22:03:11', action: 'blocked' }
    ];

    incidents.forEach((incident, index) => {
        const row = document.createElement('tr');
        row.style.opacity = '0';
        row.style.transform = 'translateX(-20px)';

        row.innerHTML = `
            <td><span class="severity-badge severity-${incident.severity}">${incident.severity}</span></td>
            <td>${incident.type}</td>
            <td>${incident.timestamp}</td>
            <td><span class="action-badge action-${incident.action}">${incident.action.toUpperCase()}</span></td>
        `;

        incidentsBody.appendChild(row);

        // Animate row appearance
        setTimeout(() => {
            row.style.transition = 'all 0.4s ease';
            row.style.opacity = '1';
            row.style.transform = 'translateX(0)';
        }, index * 100);
    });
}

// Login functionality
function initLogin() {
    const loginModal = document.getElementById('loginModal');
    const loginIcon = document.getElementById('loginIcon');
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');

    // Check if user is already logged in
    const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
    const mainContent = document.querySelector('.main-content');

    if (!isLoggedIn) {
        // Show login modal on page load if not logged in
        loginModal.classList.add('active');
        // Hide main content
        if (mainContent) {
            mainContent.classList.add('hidden');
        }
    } else {
        // Show main content if already logged in
        if (mainContent) {
            mainContent.classList.remove('hidden');
        }
    }

    // Open login modal when icon is clicked
    if (loginIcon) {
        loginIcon.addEventListener('click', function () {
            loginModal.classList.add('active');
        });
    }

    // Close modal when clicking outside
    loginModal.addEventListener('click', function (e) {
        if (e.target === loginModal) {
            // Don't allow closing if not logged in
            if (!isLoggedIn) {
                return;
            }
            loginModal.classList.remove('active');
        }
    });

    // Handle form submission
    if (loginForm) {
        loginForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value.trim();

            // Clear previous error
            errorMessage.classList.remove('show');
            errorMessage.textContent = '';

            // Simple verification (in production, use proper authentication)
            if (username && password) {
                // Simulate authentication check
                // For demo purposes, accept any non-empty credentials
                // In production, verify against backend

                // Show loading state
                const submitButton = loginForm.querySelector('.cyberpunk-button');
                const originalText = submitButton.innerHTML;
                submitButton.innerHTML = '<span>VERIFYING...</span>';
                submitButton.disabled = true;

                // Simulate API call delay
                setTimeout(() => {
                    // Set logged in status
                    sessionStorage.setItem('isLoggedIn', 'true');
                    sessionStorage.setItem('username', username);

                    // Hide modal
                    loginModal.classList.remove('active');

                    // Show main content
                    const mainContent = document.querySelector('.main-content');
                    if (mainContent) {
                        mainContent.classList.remove('hidden');
                        // Initialize dashboard components
                        initMetricAnimations();
                        initThreatChart();
                        initLatencyChart();
                        initHeatmap();
                        initIncidentsTable();
                    }

                    // Reset form
                    loginForm.reset();
                    submitButton.innerHTML = originalText;
                    submitButton.disabled = false;

                    // Show success message (optional)
                    console.log('Login successful!');
                }, 1500);
            } else {
                // Show error
                errorMessage.textContent = 'INVALID CREDENTIALS. ACCESS DENIED.';
                errorMessage.classList.add('show');
            }
        });
    }
}

// Initialize all components when DOM is ready
document.addEventListener('DOMContentLoaded', function () {
    // Initialize login first
    initLogin();

    // Only initialize dashboard if logged in
    const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
    if (isLoggedIn) {
        initMetricAnimations();
        initThreatChart();
        initLatencyChart();
        initHeatmap();
        initIncidentsTable();

        // Add smooth scroll behavior
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        // Add hover effects to cards
        document.querySelectorAll('.metric-card, .chart-card').forEach(card => {
            card.addEventListener('mouseenter', function () {
                this.style.transform = 'translateY(-4px)';
            });

            card.addEventListener('mouseleave', function () {
                this.style.transform = 'translateY(0)';
            });
        });
    }
});

// Simulate live data updates (optional)
setInterval(() => {
    // Update live indicator pulse
    const liveDot = document.querySelector('.live-dot');
    if (liveDot) {
        liveDot.style.animation = 'none';
        setTimeout(() => {
            liveDot.style.animation = 'pulse 2s infinite';
        }, 10);
    }
}, 5000);

/**
 * PROJECT AEGIS - Premium Cursor Trail
 */
const initCursorTrail = () => {
    const container = document.getElementById('cursor-trail-container');
    if (!container) return;

    let particles = [];
    const particleCount = 20;

    for (let i = 0; i < particleCount; i++) {
        const p = document.createElement('div');
        p.className = 'cursor-particle';
        p.style.width = '6px';
        p.style.height = '6px';
        p.style.opacity = '0';
        container.appendChild(p);
        particles.push({
            el: p,
            x: 0,
            y: 0,
            targetX: 0,
            targetY: 0,
            alpha: 0
        });
    }

    let mouseX = 0;
    let mouseY = 0;

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    const animate = () => {
        let x = mouseX;
        let y = mouseY;

        particles.forEach((p, index) => {
            const nextP = particles[index + 1] || particles[0];

            p.x += (x - p.x) * 0.35;
            p.y += (y - p.y) * 0.35;

            p.el.style.transform = `translate(${p.x}px, ${p.y}px) scale(${1 - index / particleCount})`;
            p.el.style.opacity = (1 - index / particleCount) * 0.6;

            x = p.x;
            y = p.y;
        });

        requestAnimationFrame(animate);
    };

    animate();
};

document.addEventListener('DOMContentLoaded', initCursorTrail);

