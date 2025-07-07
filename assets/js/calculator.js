// Google Ads ROI Calculator based on industry principles
class GoogleAdsROICalculator {
    constructor() {
        this.initializeCalculator();
    }

    initializeCalculator() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupEventListeners());
        } else {
            this.setupEventListeners();
        }
    }

    setupEventListeners() {
        const calculateBtn = document.getElementById('calculate-roi-btn');
        const inputs = document.querySelectorAll('.calculator-input');
        
        if (calculateBtn) {
            calculateBtn.addEventListener('click', () => this.calculateROI());
        }

        // Add real-time validation
        inputs.forEach(input => {
            input.addEventListener('input', () => this.validateInput(input));
            input.addEventListener('blur', () => this.formatInput(input));
        });

        // Add Enter key support
        inputs.forEach(input => {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.calculateROI();
                }
            });
        });
    }

    validateInput(input) {
        const value = parseFloat(input.value);
        const min = parseFloat(input.getAttribute('min')) || 0;
        const max = parseFloat(input.getAttribute('max')) || Infinity;

        // Remove any existing error styling
        input.classList.remove('error');
        
        if (isNaN(value) || value < min || value > max) {
            input.classList.add('error');
            return false;
        }
        return true;
    }

    formatInput(input) {
        const value = parseFloat(input.value);
        if (!isNaN(value)) {
            if (input.id.includes('budget') || input.id.includes('cpc') || input.id.includes('value')) {
                input.value = value.toFixed(2);
            } else if (input.id.includes('rate')) {
                input.value = Math.min(100, Math.max(0, value)).toFixed(2);
            }
        }
    }

    calculateROI() {
        // Get input values
        const monthlyBudget = parseFloat(document.getElementById('monthly-budget').value) || 0;
        const avgCPC = parseFloat(document.getElementById('avg-cpc').value) || 0;
        const conversionRate = parseFloat(document.getElementById('conversion-rate').value) || 0;
        const avgOrderValue = parseFloat(document.getElementById('avg-order-value').value) || 0;
        const profitMargin = parseFloat(document.getElementById('profit-margin').value) || 0;

        const resultDiv = document.getElementById('roi-result');
        
        // Validate inputs
        if (!this.validateAllInputs()) {
            this.showError('Please fill in all fields with valid values.');
            return;
        }

        if (monthlyBudget <= 0 || avgCPC <= 0 || conversionRate <= 0 || avgOrderValue <= 0) {
            this.showError('All values must be greater than 0.');
            return;
        }

        try {
            // Google Ads ROI Calculations
            const calculations = this.performCalculations({
                monthlyBudget,
                avgCPC,
                conversionRate,
                avgOrderValue,
                profitMargin
            });

            this.displayResults(calculations);
            this.showRecommendations(calculations);
            
        } catch (error) {
            console.error('Calculation error:', error);
            this.showError('An error occurred during calculation. Please check your inputs.');
        }
    }

    performCalculations(inputs) {
        const { monthlyBudget, avgCPC, conversionRate, avgOrderValue, profitMargin } = inputs;

        // Core Google Ads metrics
        const monthlyClicks = monthlyBudget / avgCPC;
        const monthlyConversions = monthlyClicks * (conversionRate / 100);
        const monthlyRevenue = monthlyConversions * avgOrderValue;
        const monthlyProfit = monthlyRevenue * (profitMargin / 100);
        const monthlyCost = monthlyBudget;
        
        // ROI and ROAS calculations
        const roi = ((monthlyProfit - monthlyCost) / monthlyCost) * 100;
        const roas = monthlyRevenue / monthlyCost;
        
        // Cost metrics
        const costPerConversion = monthlyCost / monthlyConversions;
        const costPerAcquisition = costPerConversion; // Same as CPA in this context
        
        // Annual projections
        const annualRevenue = monthlyRevenue * 12;
        const annualProfit = monthlyProfit * 12;
        const annualCost = monthlyCost * 12;
        const annualROI = ((annualProfit - annualCost) / annualCost) * 100;

        // Break-even analysis
        const breakEvenCPC = (avgOrderValue * (conversionRate / 100) * (profitMargin / 100));
        const profitabilityThreshold = (costPerConversion / avgOrderValue) * 100;

        return {
            monthly: {
                clicks: monthlyClicks,
                conversions: monthlyConversions,
                revenue: monthlyRevenue,
                profit: monthlyProfit,
                cost: monthlyCost,
                roi: roi,
                roas: roas,
                cpa: costPerAcquisition,
                cpc: avgCPC
            },
            annual: {
                revenue: annualRevenue,
                profit: annualProfit,
                cost: annualCost,
                roi: annualROI
            },
            metrics: {
                breakEvenCPC: breakEvenCPC,
                profitabilityThreshold: profitabilityThreshold,
                marginOfSafety: ((breakEvenCPC - avgCPC) / breakEvenCPC) * 100
            }
        };
    }

    displayResults(calculations) {
        const { monthly, annual, metrics } = calculations;
        
        const resultHTML = `
            <div class="roi-results-container">
                <div class="results-header">
                    <h3><i class="fas fa-chart-line"></i> Your Google Ads ROI Analysis</h3>
                    <div class="roi-status ${monthly.roi > 0 ? 'profitable' : 'unprofitable'}">
                        ${monthly.roi > 0 ? 'Profitable Campaign' : 'Needs Optimization'}
                    </div>
                </div>

                <div class="results-grid">
                    <!-- Key Metrics -->
                    <div class="metric-card primary">
                        <div class="metric-icon"><i class="fas fa-percentage"></i></div>
                        <div class="metric-value">${monthly.roi.toFixed(1)}%</div>
                        <div class="metric-label">Monthly ROI</div>
                        <div class="metric-trend ${monthly.roi > 0 ? 'positive' : 'negative'}">
                            ${monthly.roi > 0 ? '↗' : '↘'} ${monthly.roi > 0 ? 'Profitable' : 'Loss'}
                        </div>
                    </div>

                    <div class="metric-card secondary">
                        <div class="metric-icon"><i class="fas fa-dollar-sign"></i></div>
                        <div class="metric-value">${monthly.roas.toFixed(2)}x</div>
                        <div class="metric-label">ROAS (Return on Ad Spend)</div>
                        <div class="metric-trend ${monthly.roas > 2 ? 'positive' : monthly.roas > 1 ? 'neutral' : 'negative'}">
                            ${monthly.roas > 2 ? 'Excellent' : monthly.roas > 1 ? 'Good' : 'Poor'}
                        </div>
                    </div>

                    <div class="metric-card accent">
                        <div class="metric-icon"><i class="fas fa-money-bill-wave"></i></div>
                        <div class="metric-value">$${monthly.revenue.toLocaleString()}</div>
                        <div class="metric-label">Monthly Revenue</div>
                        <div class="metric-trend">
                            ${monthly.conversions.toFixed(0)} conversions
                        </div>
                    </div>

                    <div class="metric-card info">
                        <div class="metric-icon"><i class="fas fa-chart-bar"></i></div>
                        <div class="metric-value">$${monthly.cpa.toFixed(2)}</div>
                        <div class="metric-label">Cost Per Acquisition</div>
                        <div class="metric-trend">
                            ${monthly.clicks.toFixed(0)} clicks
                        </div>
                    </div>
                </div>

                <!-- Detailed Breakdown -->
                <div class="detailed-breakdown">
                    <h4><i class="fas fa-analytics"></i> Detailed Analysis</h4>
                    
                    <div class="breakdown-section">
                        <h5>Monthly Performance</h5>
                        <div class="breakdown-grid">
                            <div class="breakdown-item">
                                <span class="label">Budget Spent:</span>
                                <span class="value">$${monthly.cost.toLocaleString()}</span>
                            </div>
                            <div class="breakdown-item">
                                <span class="label">Revenue Generated:</span>
                                <span class="value">$${monthly.revenue.toLocaleString()}</span>
                            </div>
                            <div class="breakdown-item">
                                <span class="label">Gross Profit:</span>
                                <span class="value">$${monthly.profit.toLocaleString()}</span>
                            </div>
                            <div class="breakdown-item">
                                <span class="label">Net Profit:</span>
                                <span class="value ${(monthly.profit - monthly.cost) > 0 ? 'positive' : 'negative'}">
                                    $${(monthly.profit - monthly.cost).toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div class="breakdown-section">
                        <h5>Annual Projections</h5>
                        <div class="breakdown-grid">
                            <div class="breakdown-item">
                                <span class="label">Annual Revenue:</span>
                                <span class="value">$${annual.revenue.toLocaleString()}</span>
                            </div>
                            <div class="breakdown-item">
                                <span class="label">Annual Profit:</span>
                                <span class="value">$${annual.profit.toLocaleString()}</span>
                            </div>
                            <div class="breakdown-item">
                                <span class="label">Annual ROI:</span>
                                <span class="value ${annual.roi > 0 ? 'positive' : 'negative'}">
                                    ${annual.roi.toFixed(1)}%
                                </span>
                            </div>
                        </div>
                    </div>

                    <div class="breakdown-section">
                        <h5>Optimization Insights</h5>
                        <div class="breakdown-grid">
                            <div class="breakdown-item">
                                <span class="label">Break-even CPC:</span>
                                <span class="value">$${metrics.breakEvenCPC.toFixed(2)}</span>
                            </div>
                            <div class="breakdown-item">
                                <span class="label">Margin of Safety:</span>
                                <span class="value ${metrics.marginOfSafety > 0 ? 'positive' : 'negative'}">
                                    ${metrics.marginOfSafety.toFixed(1)}%
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('roi-result').innerHTML = resultHTML;
    }

    showRecommendations(calculations) {
        const { monthly, metrics } = calculations;
        const recommendations = [];

        // ROI-based recommendations
        if (monthly.roi < 0) {
            recommendations.push({
                type: 'warning',
                title: 'Campaign is Currently Unprofitable',
                message: 'Consider reducing CPC, improving conversion rate, or increasing profit margins.'
            });
        } else if (monthly.roi < 50) {
            recommendations.push({
                type: 'info',
                title: 'Room for Improvement',
                message: 'Your ROI is positive but could be optimized further.'
            });
        } else {
            recommendations.push({
                type: 'success',
                title: 'Excellent Performance',
                message: 'Your campaign is performing well. Consider scaling up your budget.'
            });
        }

        // ROAS recommendations
        if (monthly.roas < 2) {
            recommendations.push({
                type: 'warning',
                title: 'Low ROAS Alert',
                message: 'Industry standard ROAS is typically 2:1 or higher. Focus on improving ad quality and targeting.'
            });
        }

        // CPC recommendations
        if (metrics.marginOfSafety < 20) {
            recommendations.push({
                type: 'caution',
                title: 'CPC Close to Break-even',
                message: `Your current CPC ($${monthly.cpc}) is close to break-even ($${metrics.breakEvenCPC.toFixed(2)}). Monitor closely.`
            });
        }

        this.displayRecommendations(recommendations);
    }

    displayRecommendations(recommendations) {
        if (recommendations.length === 0) return;

        const recommendationsHTML = `
            <div class="recommendations-section">
                <h4><i class="fas fa-lightbulb"></i> Optimization Recommendations</h4>
                <div class="recommendations-list">
                    ${recommendations.map(rec => `
                        <div class="recommendation-item ${rec.type}">
                            <div class="rec-icon">
                                <i class="fas fa-${this.getRecommendationIcon(rec.type)}"></i>
                            </div>
                            <div class="rec-content">
                                <h5>${rec.title}</h5>
                                <p>${rec.message}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        document.getElementById('roi-result').innerHTML += recommendationsHTML;
    }

    getRecommendationIcon(type) {
        const icons = {
            'success': 'check-circle',
            'warning': 'exclamation-triangle',
            'info': 'info-circle',
            'caution': 'exclamation-circle'
        };
        return icons[type] || 'info-circle';
    }

    validateAllInputs() {
        const inputs = document.querySelectorAll('.calculator-input');
        let allValid = true;

        inputs.forEach(input => {
            if (!this.validateInput(input)) {
                allValid = false;
            }
        });

        return allValid;
    }

    showError(message) {
        const resultDiv = document.getElementById('roi-result');
        resultDiv.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <h4>Calculation Error</h4>
                <p>${message}</p>
            </div>
        `;
    }

    // Utility method to reset calculator
    resetCalculator() {
        const inputs = document.querySelectorAll('.calculator-input');
        inputs.forEach(input => {
            input.value = '';
            input.classList.remove('error');
        });
        document.getElementById('roi-result').innerHTML = '';
    }
}

// Initialize calculator when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.roiCalculator = new GoogleAdsROICalculator();
});

// Export for potential module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GoogleAdsROICalculator;
}

