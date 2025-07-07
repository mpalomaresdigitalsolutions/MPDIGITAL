class BlogScanner {
    constructor() {
        this.debounceTimeout = null; // For throttling MutationObserver
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.scanCurrentPage();
    }

    setupEventListeners() {
        // Auto-scan when blog content changes, throttled to 500ms
        const observer = new MutationObserver(() => {
            clearTimeout(this.debounceTimeout);
            this.debounceTimeout = setTimeout(() => {
                this.scanCurrentPage();
            }, 500);
        });

        // Observe .blog-grid specifically to reduce unnecessary triggers
        const target = document.querySelector('.blog-grid') || document.body;
        observer.observe(target, {
            childList: true,
            subtree: true
        });

        // Manual scan trigger
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('scan-content-btn')) {
                e.preventDefault();
                this.performFullScan();
            }
        });
    }

    scanCurrentPage() {
        if (document.querySelector('.blog-post-content')) {
            this.scanBlogPost();
        } else if (document.querySelector('.blog-grid')) {
            this.scanBlogListing();
        }
    }

    scanBlogPost() {
        const post = this.extractPostData();
        if (!post) return;

        const analysis = this.analyzeContent(post);
        this.displayAnalysis(analysis);
        this.updateSEOScore(analysis);
    }

    scanBlogListing() {
        const posts = this.extractPostsFromListing();
        const overallAnalysis = this.analyzeBlogPerformance(posts);
        this.displayBlogAnalytics(overallAnalysis);
    }

    extractPostData() {
        const titleElement = document.querySelector('.post-title, h1');
        const contentElement = document.querySelector('.post-content');
        const metaDescription = document.querySelector('meta[name="description"]');
        
        if (!titleElement || !contentElement) return null;

        return {
            title: titleElement.textContent.trim(),
            content: contentElement.textContent.trim(),
            metaDescription: metaDescription ? metaDescription.getAttribute('content') : '',
            headings: this.extractHeadings(),
            images: this.extractImages(),
            links: this.extractLinks(),
            wordCount: this.getWordCount(contentElement.textContent)
        };
    }

    extractPostsFromListing() {
        const blogGrid = document.querySelector('.blog-grid');
        if (!blogGrid) return [];

        const postElements = blogGrid.querySelectorAll('.blog-post');
        return Array.from(postElements).map(post => ({
            title: post.querySelector('.post-title')?.textContent.trim() || '',
            excerpt: post.querySelector('.post-excerpt')?.textContent.trim() || '',
            url: post.querySelector('a')?.href || '',
            date: post.querySelector('.post-date')?.textContent.trim() || ''
        }));
    }

    extractHeadings() {
        const headings = document.querySelectorAll('.post-content h1, .post-content h2, .post-content h3, .post-content h4, .post-content h5, .post-content h6');
        return Array.from(headings).map(h => ({
            level: parseInt(h.tagName.charAt(1)),
            text: h.textContent.trim(),
            id: h.id || ''
        }));
    }

    extractImages() {
        const images = document.querySelectorAll('.post-content img');
        return Array.from(images).map(img => ({
            src: img.src,
            alt: img.alt || '',
            title: img.title || '',
            hasAlt: !!img.alt,
            hasTitle: !!img.title
        }));
    }

    extractLinks() {
        const links = document.querySelectorAll('.post-content a');
        return Array.from(links).map(link => ({
            href: link.href,
            text: link.textContent.trim(),
            isExternal: !link.href.includes(window.location.hostname),
            hasTitle: !!link.title,
            opensInNewTab: link.target === '_blank'
        }));
    }

    analyzeContent(post) {
        const analysis = {
            seo: this.analyzeSEO(post),
            readability: this.analyzeReadability(post),
            structure: this.analyzeStructure(post),
            performance: this.analyzePerformance(post),
            accessibility: this.analyzeAccessibility(post)
        };

        analysis.overallScore = this.calculateOverallScore(analysis);
        return analysis;
    }

    analyzeSEO(post) {
        const seo = {
            titleLength: post.title.length,
            titleOptimal: post.title.length >= 30 && post.title.length <= 60,
            metaDescriptionLength: post.metaDescription.length,
            metaDescriptionOptimal: post.metaDescription.length >= 120 && post.metaDescription.length <= 160,
            headingStructure: this.checkHeadingStructure(post.headings),
            keywordDensity: this.calculateKeywordDensity(post.content),
            internalLinks: post.links.filter(link => !link.isExternal).length,
            externalLinks: post.links.filter(link => link.isExternal).length,
            imageOptimization: this.checkImageOptimization(post.images)
        };

        seo.score = this.calculateSEOScore(seo);
        return seo;
    }

    analyzeReadability(post) {
        const sentences = post.content.split(/[.!?]+/).filter(s => s.trim().length > 0);
        const words = post.content.split(/\s+/).filter(w => w.length > 0);
        const syllables = this.countSyllables(post.content);

        const avgWordsPerSentence = words.length / sentences.length;
        const avgSyllablesPerWord = syllables / words.length;

        // Flesch Reading Ease Score
        const fleschScore = 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord);

        return {
            wordCount: words.length,
            sentenceCount: sentences.length,
            avgWordsPerSentence: avgWordsPerSentence,
            avgSyllablesPerWord: avgSyllablesPerWord,
            fleschScore: Math.max(0, Math.min(100, fleschScore)),
            readingLevel: this.getReadingLevel(fleschScore),
            estimatedReadingTime: Math.ceil(words.length / 200)
        };
    }

    analyzeStructure(post) {
        return {
            hasH1: post.headings.some(h => h.level === 1),
            hasH2: post.headings.some(h => h.level === 2),
            headingCount: post.headings.length,
            headingDistribution: this.getHeadingDistribution(post.headings),
            paragraphCount: this.countParagraphs(post.content),
            listCount: this.countLists(),
            hasTableOfContents: !!document.querySelector('.table-of-contents')
        };
    }

    analyzePerformance(post) {
        return {
            imageCount: post.images.length,
            largeImages: this.checkImageSizes(post.images),
            loadTime: this.estimateLoadTime(post),
            mobileOptimized: this.checkMobileOptimization(),
            cacheOptimized: this.checkCacheHeaders()
        };
    }

    analyzeAccessibility(post) {
        return {
            imagesWithAlt: post.images.filter(img => img.hasAlt).length,
            imagesWithoutAlt: post.images.filter(img => !img.hasAlt).length,
            linksWithTitle: post.links.filter(link => link.hasTitle).length,
            colorContrast: this.checkColorContrast(),
            focusableElements: this.checkFocusableElements(),
            ariaLabels: this.checkAriaLabels()
        };
    }

    analyzeBlogPerformance(posts) {
        if (posts.length === 0) {
            return {
                postCount: 0,
                averageTitleLength: 0,
                postsWithExcerpt: 0,
                postsWithDate: 0,
                score: 0
            };
        }

        const totalTitleLength = posts.reduce((sum, post) => sum + post.title.length, 0);
        const postsWithExcerpt = posts.filter(post => post.excerpt).length;
        const postsWithDate = posts.filter(post => post.date).length;

        const score = Math.min(100, (
            (posts.length >= 3 ? 30 : posts.length * 10) + // Reward more posts
            (postsWithExcerpt / posts.length * 30) + // Reward excerpts
            (postsWithDate / posts.length * 20) + // Reward dates
            ((totalTitleLength / posts.length >= 30 && totalTitleLength / posts.length <= 60) ? 20 : 0) // Reward optimal title length
        ));

        return {
            postCount: posts.length,
            averageTitleLength: totalTitleLength / posts.length,
            postsWithExcerpt: postsWithExcerpt,
            postsWithDate: postsWithDate,
            score: Math.round(score)
        };
    }

    displayBlogAnalytics(analysis) {
        const analysisContainer = document.querySelector('.content-analysis');
        if (!analysisContainer) return;

        const analysisHTML = `
            <div class="analysis-results">
                <div class="analysis-header">
                    <h3><i class="fas fa-chart-bar"></i> Blog Listing Analysis</h3>
                    <div class="overall-score score-${this.getScoreClass(analysis.score)}">
                        ${analysis.score}/100
                    </div>
                </div>

                <div class="analysis-sections">
                    <div class="analysis-section">
                        <h4><i class="fas fa-list"></i> Blog Metrics</h4>
                        <div class="score-bar">
                            <div class="score-fill" style="width: ${analysis.score}%"></div>
                            <span class="score-text">${analysis.score}/100</span>
                        </div>
                        <ul class="analysis-items">
                            <li>Total Posts: ${analysis.postCount}</li>
                            <li>Average Title Length: ${analysis.averageTitleLength.toFixed(1)} characters</li>
                            <li>Posts with Excerpt: ${analysis.postsWithExcerpt}/${analysis.postCount}</li>
                            <li>Posts with Date: ${analysis.postsWithDate}/${analysis.postCount}</li>
                        </ul>
                    </div>

                    <div class="recommendations">
                        <h4><i class="fas fa-lightbulb"></i> Recommendations</h4>
                        <ul>
                            ${this.generateBlogRecommendations(analysis)}
                        </ul>
                    </div>
                </div>
            </div>
        `;

        analysisContainer.innerHTML = analysisHTML;
    }

    generateBlogRecommendations(analysis) {
        const recommendations = [];

        if (analysis.postCount < 3) {
            recommendations.push('Add more blog posts to improve content variety');
        }
        if (analysis.postsWithExcerpt < analysis.postCount) {
            recommendations.push('Add excerpts to all posts for better user engagement');
        }
        if (analysis.postsWithDate < analysis.postCount) {
            recommendations.push('Include publication dates for all posts');
        }
        if (analysis.averageTitleLength < 30 || analysis.averageTitleLength > 60) {
            recommendations.push('Optimize post titles to 30-60 characters for SEO');
        }
        if (recommendations.length === 0) {
            recommendations.push('Great job! Your blog listing follows best practices.');
        }

        return recommendations.map(rec => `<li>${rec}</li>`).join('');
    }

    calculateOverallScore(analysis) {
        const weights = {
            seo: 0.3,
            readability: 0.25,
            structure: 0.2,
            performance: 0.15,
            accessibility: 0.1
        };

        let totalScore = 0;
        totalScore += analysis.seo.score * weights.seo;
        totalScore += this.calculateReadabilityScore(analysis.readability) * weights.readability;
        totalScore += this.calculateStructureScore(analysis.structure) * weights.structure;
        totalScore += this.calculatePerformanceScore(analysis.performance) * weights.performance;
        totalScore += this.calculateAccessibilityScore(analysis.accessibility) * weights.accessibility;

        return Math.round(totalScore);
    }

    displayAnalysis(analysis) {
        const analysisContainer = document.querySelector('.content-analysis');
        if (!analysisContainer) return;

        const analysisHTML = `
            <div class="analysis-results">
                <div class="analysis-header">
                    <h3><i class="fas fa-search"></i> Content Analysis</h3>
                    <div class="overall-score score-${this.getScoreClass(analysis.overallScore)}">
                        ${analysis.overallScore}/100
                    </div>
                </div>

                <div class="analysis-sections">
                    <div class="analysis-section">
                        <h4><i class="fas fa-search-plus"></i> SEO Analysis</h4>
                        <div class="score-bar">
                            <div class="score-fill" style="width: ${analysis.seo.score}%"></div>
                            <span class="score-text">${analysis.seo.score}/100</span>
                        </div>
                        <ul class="analysis-items">
                            <li class="${analysis.seo.titleOptimal ? 'good' : 'warning'}">
                                Title Length: ${analysis.seo.titleLength} characters
                                ${analysis.seo.titleOptimal ? '✓' : '⚠️'}
                            </li>
                            <li class="${analysis.seo.metaDescriptionOptimal ? 'good' : 'warning'}">
                                Meta Description: ${analysis.seo.metaDescriptionLength} characters
                                ${analysis.seo.metaDescriptionOptimal ? '✓' : '⚠️'}
                            </li>
                            <li class="${analysis.seo.headingStructure ? 'good' : 'error'}">
                                Heading Structure ${analysis.seo.headingStructure ? '✓' : '❌'}
                            </li>
                        </ul>
                    </div>

                    <div class="analysis-section">
                        <h4><i class="fas fa-book-open"></i> Readability</h4>
                        <div class="score-bar">
                            <div class="score-fill" style="width: ${this.calculateReadabilityScore(analysis.readability)}%"></div>
                            <span class="score-text">${this.calculateReadabilityScore(analysis.readability)}/100</span>
                        </div>
                        <ul class="analysis-items">
                            <li>Word Count: ${analysis.readability.wordCount}</li>
                            <li>Reading Level: ${analysis.readability.readingLevel}</li>
                            <li>Estimated Reading Time: ${analysis.readability.estimatedReadingTime} minutes</li>
                            <li>Flesch Score: ${analysis.readability.fleschScore.toFixed(1)}</li>
                        </ul>
                    </div>

                    <div class="analysis-section">
                        <h4><i class="fas fa-sitemap"></i> Structure</h4>
                        <div class="score-bar">
                            <div class="score-fill" style="width: ${this.calculateStructureScore(analysis.structure)}%"></div>
                            <span class="score-text">${this.calculateStructureScore(analysis.structure)}/100</span>
                        </div>
                        <ul class="analysis-items">
                            <li class="${analysis.structure.hasH1 ? 'good' : 'error'}">
                                H1 Tag ${analysis.structure.hasH1 ? '✓' : '❌'}
                            </li>
                            <li class="${analysis.structure.hasH2 ? 'good' : 'warning'}">
                                H2 Tags ${analysis.structure.hasH2 ? '✓' : '⚠️'}
                            </li>
                            <li>Total Headings: ${analysis.structure.headingCount}</li>
                            <li>Paragraphs: ${analysis.structure.paragraphCount}</li>
                        </ul>
                    </div>

                    <div class="analysis-section">
                        <h4><i class="fas fa-universal-access"></i> Accessibility</h4>
                        <div class="score-bar">
                            <div class="score-fill" style="width: ${this.calculateAccessibilityScore(analysis.accessibility)}%"></div>
                            <span class="score-text">${this.calculateAccessibilityScore(analysis.accessibility)}/100</span>
                        </div>
                        <ul class="analysis-items">
                            <li class="${analysis.accessibility.imagesWithoutAlt === 0 ? 'good' : 'error'}">
                                Images with Alt Text: ${analysis.accessibility.imagesWithAlt}/${analysis.accessibility.imagesWithAlt + analysis.accessibility.imagesWithoutAlt}
                            </li>
                            <li>Links with Titles: ${analysis.accessibility.linksWithTitle}</li>
                        </ul>
                    </div>
                </div>

                <div class="recommendations">
                    <h4><i class="fas fa-lightbulb"></i> Recommendations</h4>
                    ${this.generateRecommendations(analysis)}
                </div>
            </div>
        `;

        analysisContainer.innerHTML = analysisHTML;
    }

    generateRecommendations(analysis) {
        const recommendations = [];

        if (!analysis.seo.titleOptimal) {
            recommendations.push('Optimize title length to 30-60 characters for better SEO');
        }

        if (!analysis.seo.metaDescriptionOptimal) {
            recommendations.push('Improve meta description length to 120-160 characters');
        }

        if (analysis.readability.fleschScore < 60) {
            recommendations.push('Improve readability by using shorter sentences and simpler words');
        }

        if (!analysis.structure.hasH2) {
            recommendations.push('Add H2 headings to improve content structure');
        }

        if (analysis.accessibility.imagesWithoutAlt > 0) {
            recommendations.push('Add alt text to all images for better accessibility');
        }

        if (recommendations.length === 0) {
            recommendations.push('Great job! Your content follows best practices.');
        }

        return recommendations.map(rec => `<li>${rec}</li>`).join('');
    }

    updateSEOScore(analysis) {
        // Placeholder for updating SEO score (e.g., meta tags or external tools)
        console.log('SEO Score Updated:', analysis.seo.score);
    }

    getWordCount(text) {
        return text.split(/\s+/).filter(word => word.length > 0).length;
    }

    countSyllables(text) {
        const words = text.toLowerCase().split(/\s+/);
        let syllableCount = 0;

        words.forEach(word => {
            word = word.replace(/[^a-z]/g, '');
            if (word.length === 0) return;

            const vowels = word.match(/[aeiouy]+/g);
            syllableCount += vowels ? vowels.length : 1;

            if (word.endsWith('e')) syllableCount--;
            if (syllableCount === 0) syllableCount = 1;
        });

        return syllableCount;
    }

    getReadingLevel(fleschScore) {
        if (fleschScore >= 90) return 'Very Easy';
        if (fleschScore >= 80) return 'Easy';
        if (fleschScore >= 70) return 'Fairly Easy';
        if (fleschScore >= 60) return 'Standard';
        if (fleschScore >= 50) return 'Fairly Difficult';
        if (fleschScore >= 30) return 'Difficult';
        return 'Very Difficult';
    }

    checkHeadingStructure(headings) {
        if (headings.length === 0) return false;
        
        let currentLevel = 0;
        for (const heading of headings) {
            if (heading.level > currentLevel + 1) return false;
            currentLevel = heading.level;
        }
        return true;
    }

    calculateKeywordDensity(content) {
        const words = content.toLowerCase().split(/\s+/);
        const wordCount = {};
        
        words.forEach(word => {
            word = word.replace(/[^a-z]/g, '');
            if (word.length > 3) {
                wordCount[word] = (wordCount[word] || 0) + 1;
            }
        });

        const topKeywords = Object.entries(wordCount)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([word, count]) => ({
                word,
                count,
                density: (count / words.length * 100).toFixed(2)
            }));

        return topKeywords;
    }

    getScoreClass(score) {
        if (score >= 80) return 'excellent';
        if (score >= 60) return 'good';
        if (score >= 40) return 'fair';
        return 'poor';
    }

    calculateSEOScore(seo) {
        let score = 0;
        if (seo.titleOptimal) score += 20;
        if (seo.metaDescriptionOptimal) score += 20;
        if (seo.headingStructure) score += 20;
        if (seo.internalLinks > 0) score += 15;
        if (seo.imageOptimization > 0.8) score += 15;
        if (seo.externalLinks > 0) score += 10;
        return score;
    }

    calculateReadabilityScore(readability) {
        let score = 0;
        if (readability.fleschScore >= 60) score += 40;
        else if (readability.fleschScore >= 30) score += 20;
        
        if (readability.avgWordsPerSentence <= 20) score += 30;
        else if (readability.avgWordsPerSentence <= 25) score += 15;
        
        if (readability.wordCount >= 300) score += 30;
        else if (readability.wordCount >= 150) score += 15;
        
        return Math.min(100, score);
    }

    calculateStructureScore(structure) {
        let score = 0;
        if (structure.hasH1) score += 30;
        if (structure.hasH2) score += 25;
        if (structure.headingCount >= 3) score += 20;
        if (structure.paragraphCount >= 3) score += 15;
        if (structure.hasTableOfContents) score += 10;
        return score;
    }

    calculatePerformanceScore(performance) {
        let score = 100;
        if (performance.largeImages > 0) score -= 20;
        if (performance.imageCount > 10) score -= 15;
        if (!performance.mobileOptimized) score -= 30;
        if (!performance.cacheOptimized) score -= 15;
        return Math.max(0, score);
    }

    calculateAccessibilityScore(accessibility) {
        const totalImages = accessibility.imagesWithAlt + accessibility.imagesWithoutAlt;
        let score = 0;
        
        if (totalImages === 0 || accessibility.imagesWithoutAlt === 0) score += 50;
        else score += (accessibility.imagesWithAlt / totalImages) * 50;
        
        if (accessibility.colorContrast) score += 25;
        if (accessibility.focusableElements) score += 15;
        if (accessibility.ariaLabels) score += 10;
        
        return score;
    }

    checkImageOptimization(images) {
        return images.filter(img => img.hasAlt).length / Math.max(images.length, 1);
    }

    getHeadingDistribution(headings) {
        const distribution = {};
        headings.forEach(h => {
            distribution[`h${h.level}`] = (distribution[`h${h.level}`] || 0) + 1;
        });
        return distribution;
    }

    countParagraphs(content) {
        return (content.match(/\n\s*\n/g) || []).length + 1;
    }

    countLists() {
        return document.querySelectorAll('.post-content ul, .post-content ol').length;
    }

    checkImageSizes(images) {
        return 0; // Placeholder
    }

    estimateLoadTime(post) {
        return 'Fast'; // Placeholder
    }

    checkMobileOptimization() {
        return window.innerWidth <= 768 || document.querySelector('meta[name="viewport"]');
    }

    checkCacheHeaders() {
        return true; // Placeholder
    }

    checkColorContrast() {
        return true; // Placeholder
    }

    checkFocusableElements() {
        return document.querySelectorAll('a, button, input, textarea, select').length > 0;
    }

    checkAriaLabels() {
        return document.querySelectorAll('[aria-label], [aria-labelledby]').length > 0;
    }

    performFullScan() {
        this.scanCurrentPage();
    }
}

// Initialize blog scanner
document.addEventListener('DOMContentLoaded', () => {
    window.blogScanner = new BlogScanner();
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BlogScanner;
}