import requests
import json
import csv
import time
import logging
from datetime import datetime
from urllib.parse import urljoin, urlparse
from bs4 import BeautifulSoup
from typing import List, Dict, Optional
import re
import random

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('malicious_url_scraper.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class TinNhiemMangScraper:
    """Main scraper class for tinnhiemmang.vn"""
    
    def __init__(self):
        self.base_url = "https://tinnhiemmang.vn"
        self.search_url = f"{self.base_url}/website-lua-dao"
        self.session = requests.Session()
        self.malicious_urls = []
        
        # Set headers to mimic a real browser
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'vi-VN,vi;q=0.9,en;q=0.8',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1'
        })
    
    def get_page_content(self, url: str) -> Optional[BeautifulSoup]:
        """Fetch and parse page content"""
        try:
            response = self.session.get(url, timeout=30)
            response.raise_for_status()
            
            # Check if page is in Vietnamese
            if 'tinnhiemmang.vn' in response.url:
                return BeautifulSoup(response.content, 'html.parser')
            return None
            
        except requests.RequestException as e:
            logger.error(f"Error fetching {url}: {e}")
            return None

    def get_pagination_info(self, soup: BeautifulSoup) -> Dict[str, Optional[str]]:
        """Extract pagination information from the page"""
        pagination_info = {
            'next_page': None,
            'total_pages': None,
            'current_page': None
        }

        try:
            pagination_div = soup.find('div', {'id': 'pagination'})
            if not pagination_div:
                return pagination_info
            
            # Find current page
            current_page = pagination_div.find('li', class_='page-item active')
            if current_page:
                pagination_info['current_page'] = current_page.get_text().strip()
            
            # Find next page link
            next_link = pagination_div.find('a', {'rel': 'next'})
            if next_link and next_link.get('href'):
                pagination_info['next_page'] = next_link['href']
            
            # Find total pages (last page number)
            page_links = pagination_div.find_all('a', class_='page-link')
            page_numbers = []
            for link in page_links:
                href = link.get('href', '')
                if 'page=' in href:
                    try:
                        page_num = int(href.split('page=')[1])
                        page_numbers.append(page_num)
                    except (ValueError, IndexError):
                        continue
            
            if page_numbers:
                pagination_info['total_pages'] = str(max(page_numbers))
                
        except Exception as e:
            logger.error(f"Error extracting pagination info: {e}")
        
        return pagination_info

    def scrape_domains_from_page(self, soup: BeautifulSoup) -> List[str]:
        """Scrape malicious domains from a single page"""
        domains = []
        
        try:
            # Find all spans with class "webkit-box-2" containing domain names
            domain_spans = soup.find_all("span", class_="webkit-box-2")
            
            for span in domain_spans:
                domain = span.get_text().strip()
                
                # Basic validation for domain format
                if domain and '.' in domain and len(domain) > 4:
                    # Clean the domain (remove any extra whitespace or characters)
                    domain = domain.strip()
                    
                    # Remove protocol if present (http://, https://, www.)
                    domain = re.sub(r'^https?://', '', domain)
                    domain = re.sub(r'^www\.', '', domain)
                    
                    # Remove trailing slash if present
                    domain = domain.rstrip('/')
                    
                    # Additional validation - check if it looks like a domain
                    if re.match(r'^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', domain):
                        domains.append(domain)
                    
        except Exception as e:
            logger.error(f"Error scraping domains from page: {e}")
    
        return domains

    def scrape_known_malicious_urls(self, max_pages: int = 10) -> List[str]:
        """Scrape known malicious URLs from multiple pages"""
        all_malicious_urls = []
        current_url = self.search_url
        pages_scraped = 0
        
        try:
            while current_url and pages_scraped < max_pages:
                logger.info(f"Scraping page {pages_scraped + 1}: {current_url}")
                
                # Get page content
                soup = self.get_page_content(current_url)
                if not soup:
                    break
                
                # Scrape domains from current page
                page_domains = self.scrape_domains_from_page(soup)
                all_malicious_urls.extend(page_domains)
                
                logger.info(f"Found {len(page_domains)} domains on page {pages_scraped + 1}")
                
                # Get pagination info
                pagination_info = self.get_pagination_info(soup)
                current_page = pagination_info.get('current_page', 'Unknown')
                total_pages = pagination_info.get('total_pages', 'Unknown')
                next_page_url = pagination_info.get('next_page')
                
                logger.info(f"Page {current_page} of {total_pages} processed")
                
                # Move to next page
                if next_page_url:
                    current_url = next_page_url
                    pages_scraped += 1
                    
                    # Add delay between requests to be respectful
                    time.sleep(random.uniform(1, 3))
                else:
                    logger.info("No more pages to scrape")
                    break
                    
        except Exception as e:
            logger.error(f"Error in scrape_known_malicious_urls: {e}")
        
        # Remove duplicates
        unique_urls = list(set(all_malicious_urls))
        logger.info(f"Total unique domains found: {len(unique_urls)} from {pages_scraped} pages")
        
        return unique_urls

    def export_to_csv(self, filename: str = None):
        """Export results to CSV"""
        if not filename:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"malicious_urls_{timestamp}.csv"
        
        try:
            with open(filename, 'w', newline='', encoding='utf-8') as csvfile:
                writer = csv.writer(csvfile)
                writer.writerow(['domain'])  # Header
                
                for domain in self.malicious_urls:
                    writer.writerow([domain])
            
            logger.info(f"Exported {len(self.malicious_urls)} URLs to {filename}")
            
        except Exception as e:
            logger.error(f"Error exporting to CSV: {e}")
    
    def export_to_json(self, filename: str = None):
        """Export results to JSON"""
        if not filename:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"malicious_urls_{timestamp}.json"
        
        try:
            data = {
                'malicious_domains': self.malicious_urls,
                'count': len(self.malicious_urls),
                'scraped_at': datetime.now().isoformat(),
                'source': 'tinnhiemmang.vn scraper'
            }
            
            with open(filename, 'w', encoding='utf-8') as jsonfile:
                json.dump(data, jsonfile, indent=2, ensure_ascii=False)
            
            logger.info(f"Exported {len(self.malicious_urls)} URLs to {filename}")
            
        except Exception as e:
            logger.error(f"Error exporting to JSON: {e}")
    
    def export_for_extension(self, filename: str = "static/blacklisted_domains.json"):
        """Export results in format for browser extension"""
        try:
            data = {
                'malicious_domains': self.malicious_urls,
                'count': len(self.malicious_urls),
                'scraped_at': datetime.now().isoformat(),
                'source': 'tinnhiemmang.vn scraper'
            }
            
            with open(filename, 'w', encoding='utf-8') as jsonfile:
                json.dump(data, jsonfile, indent=2, ensure_ascii=False)
            
            logger.info(f"Exported {len(self.malicious_urls)} URLs for extension to {filename}")
            
        except Exception as e:
            logger.error(f"Error exporting for extension: {e}")

def main():
    """Main execution function with pagination support"""
    scraper = TinNhiemMangScraper()
    
    print("TinNhiemMang.vn Malicious URL Scraper")
    print("=" * 40)
    
    # Ask user for number of pages to scrape
    try:
        max_pages = int(input("Enter number of pages to scrape (default 10): ") or "10")
    except ValueError:
        max_pages = 10
    
    # Scrape malicious URLs from multiple pages
    print(f"\n1. Scraping malicious URLs from up to {max_pages} pages...")
    malicious_urls = scraper.scrape_known_malicious_urls(max_pages=max_pages)
    scraper.malicious_urls.extend(malicious_urls)
    
    # Export results
    if scraper.malicious_urls:
        print(f"\n2. Found {len(scraper.malicious_urls)} unique malicious URLs")
        scraper.export_to_csv()
        scraper.export_to_json()
        scraper.export_for_extension()
        
        print(f"\nFirst 10 malicious URLs found:")
        for domain in scraper.malicious_urls[:10]:
            print(f"- {domain}")
        
        if len(scraper.malicious_urls) > 10:
            print(f"... and {len(scraper.malicious_urls) - 10} more")
    else:
        print("\nNo malicious URLs found.")
    
    print("\nScraping completed!")

if __name__ == "__main__":
    main()