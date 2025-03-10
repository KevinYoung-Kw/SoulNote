#!/usr/bin/env python3
"""
Helper script to update astrology data manually or via cron.
This can be used independently of the Flask application.
"""

import os
import sys
import json
import logging
import requests
from bs4 import BeautifulSoup
from datetime import datetime
import time

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Cache file location
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
CACHE_FILE = os.path.join(SCRIPT_DIR, "astro_cache.json")

def load_cache():
    """Load cache from file if exists"""
    try:
        if os.path.exists(CACHE_FILE):
            with open(CACHE_FILE, 'r', encoding='utf-8') as f:
                cache = json.load(f)
            logger.info("Cache loaded successfully")
            return cache
        return {}
    except Exception as e:
        logger.error(f"Error loading cache: {e}")
        return {}

def save_cache(cache):
    """Save cache to file"""
    try:
        with open(CACHE_FILE, 'w', encoding='utf-8') as f:
            json.dump(cache, f, ensure_ascii=False, indent=2)
        logger.info("Cache saved successfully")
    except Exception as e:
        logger.error(f"Error saving cache: {e}")

def fetch_astro_data(num, cache):
    """Fetch astrology data for a specific sign"""
    try:
        # Add timeout to prevent hanging requests
        r = requests.get(
            f'http://astro.click108.com.tw/daily_{num}.php?iAstro={num}', 
            timeout=30
        )
        r.raise_for_status()
        
        # Parse HTML
        soup = BeautifulSoup(r.text, 'html.parser')
        astro = soup.select("div.TODAY_CONTENT > h3")[0]
        items = soup.select("div.TODAY_CONTENT > p")
        
        # Format data - Store both raw HTML response and structured data
        result = {
            "title": astro.text,
            "items": [item.text for item in items],
            "html": astro.text + "<br>" + "<br>".join([item.text + "<br>" for item in items]),
            "date": datetime.now().strftime("%Y-%m-%d"),
            "timestamp": datetime.now().isoformat()
        }
        
        return result
    except Exception as e:
        logger.error(f"Error fetching astrology data for sign {num}: {e}")
        return None

def needs_update(num, cache):
    """Check if the astrology data needs to be updated"""
    today = datetime.now().strftime("%Y-%m-%d")
    
    # If not in cache or not from today, needs update
    if str(num) not in cache or 'date' not in cache[str(num)] or cache[str(num)]['date'] != today:
        return True
        
    try:
        # Fetch current data to compare
        # Add timeout to prevent hanging requests
        r = requests.get(
            f'http://astro.click108.com.tw/daily_{num}.php?iAstro={num}', 
            timeout=30
        )
        r.raise_for_status()
        
        # Parse HTML
        soup = BeautifulSoup(r.text, 'html.parser')
        items = soup.select("div.TODAY_CONTENT > p")
        current_items = [item.text for item in items]
        
        # Compare with cached items
        if 'items' in cache[str(num)]:
            cached_items = cache[str(num)]['items']
            # Check if content has changed
            if cached_items != current_items:
                logger.info(f"Content changed for astrology {num}")
                return True
                
        return False
    except Exception as e:
        logger.error(f"Error checking for updates for astrology {num}: {e}")
        # In case of error, assume update is needed
        return True

def update_all_astro_data(max_retries=3, retry_delay=5):
    """Update data for all 12 astrology signs with retry logic"""
    logger.info("Starting update for all astrology signs")
    cache = load_cache()
    updated = False
    failed_signs = []
    
    for num in range(12):  # 0-11 for the 12 signs
        retries = 0
        success = False
        
        while retries < max_retries and not success:
            try:
                # Check if needs update
                if needs_update(num, cache):
                    logger.info(f"Updating data for astrology sign {num}")
                    data = fetch_astro_data(num, cache)
                    if data:
                        cache[str(num)] = data
                        updated = True
                        success = True
                    else:
                        raise Exception(f"Failed to fetch data for sign {num}")
                else:
                    logger.info(f"No update needed for astrology sign {num}")
                    success = True
            except Exception as e:
                retries += 1
                if retries < max_retries:
                    logger.warning(f"Error processing astrology sign {num} (attempt {retries}/{max_retries}): {e}")
                    logger.info(f"Waiting {retry_delay} seconds before retry")
                    time.sleep(retry_delay)
                else:
                    logger.error(f"Failed to update astrology sign {num} after {max_retries} attempts: {e}")
                    failed_signs.append(num)
        
    # Save cache if any updates were made
    if updated:
        logger.info("Updates found, saving cache")
        save_cache(cache)
    else:
        logger.info("No updates found for any astrology sign")
        
    return failed_signs

def retry_failed_signs(failed_signs, cache, max_retries=3, retry_delay=5):
    """Retry updating failed signs"""
    if not failed_signs:
        return []
        
    logger.info(f"Retrying update for {len(failed_signs)} failed signs: {failed_signs}")
    updated = False
    still_failed = []
    
    for num in failed_signs:
        retries = 0
        success = False
        
        while retries < max_retries and not success:
            try:
                logger.info(f"Retry {retries+1/{max_retries} for sign {num}")
                data = fetch_astro_data(num, cache)
                if data:
                    cache[str(num)] = data
                    updated = True
                    success = True
                else:
                    raise Exception(f"Failed to fetch data for sign {num}")
            except Exception as e:
                retries += 1
                if retries < max_retries:
                    logger.warning(f"Error during retry for sign {num} (attempt {retries}/{max_retries}): {e}")
                    time.sleep(retry_delay)
                else:
                    logger.error(f"Failed to update sign {num} after {max_retries} retries")
                    still_failed.append(num)
    
    # Save cache if any updates were made
    if updated:
        logger.info("Updates found during retries, saving cache")
        save_cache(cache)
        
    return still_failed

if __name__ == "__main__":
    try:
        # Initial update attempt
        cache = load_cache()
        failed_signs = update_all_astro_data()
        
        # If there are failed signs, retry them
        if failed_signs:
            logger.info(f"Initial update had {len(failed_signs)} failed signs. Retrying...")
            still_failed = retry_failed_signs(failed_signs, cache)
            
            if still_failed:
                logger.warning(f"Could not update {len(still_failed)} signs after retries: {still_failed}")
                sys.exit(1)
        
        logger.info("Update process completed successfully")
    except Exception as e:
        logger.error(f"Error in update process: {e}")
        sys.exit(1)
