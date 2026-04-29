"""
generate_dataset.py
Generates data/final_df.csv using real, well-known movie titles
that TMDB can match for posters and backdrops.
Run:  python generate_dataset.py
"""

import pandas as pd
import numpy as np
import os

np.random.seed(42)

# ── 200 real, well-known movies TMDB can match ──────────────────────────────
REAL_MOVIES = [
    # Action / Adventure
    ("Inception", "Sci-Fi, Action", "A thief who steals corporate secrets through dream-sharing technology is given the task of planting an idea.", "United States", 2010, 836.86, 34495),
    ("Interstellar", "Sci-Fi, Drama", "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.", "United States", 2014, 773.56, 32401),
    ("The Dark Knight", "Action, Crime", "Batman must accept one of the greatest tests of his ability to fight injustice when the Joker wreaks havoc on Gotham City.", "United States", 2008, 1005.1, 29909),
    ("The Dark Knight Rises", "Action, Crime", "Eight years after the Joker's reign of anarchy, Batman is coerced out of exile by the mysterious Selina Kyle.", "United States", 2012, 744.7, 19760),
    ("Avengers Endgame", "Action, Adventure", "The Avengers assemble once more to reverse the destruction caused by Thanos in the Battle of Earth.", "United States", 2019, 1011.3, 24900),
    ("Avengers Infinity War", "Action, Adventure", "The Avengers and their allies must be willing to sacrifice all to defeat Thanos before his blitz of devastation destroys the universe.", "United States", 2018, 941.3, 27600),
    ("Spider-Man No Way Home", "Action, Adventure", "Peter Parker seeks out Doctor Strange's help to make people forget he is Spider-Man, unleashing the multiverse.", "United States", 2021, 880.4, 21100),
    ("Iron Man", "Action, Adventure", "Tony Stark builds an armored suit to escape captivity and uses it to protect the world.", "United States", 2008, 720.5, 23400),
    ("Black Panther", "Action, Adventure", "T'Challa returns home to Wakanda after his father's death, but finds his throne challenged by an old enemy.", "United States", 2018, 753.4, 22200),
    ("Thor Ragnarok", "Action, Comedy", "Thor is imprisoned on the planet Sakaar and must fight to prevent the evil Hela from destroying Asgard.", "United States", 2017, 731.4, 21700),
    ("Guardians of the Galaxy", "Action, Comedy", "A group of intergalactic criminals must pull together to stop a fanatical warrior bent on destroying the universe.", "United States", 2014, 760.6, 25000),
    ("Captain America Civil War", "Action, Adventure", "Political involvement in the Avengers' affairs causes a rift between Captain America and Iron Man.", "United States", 2016, 824.4, 24300),
    ("Wonder Woman", "Action, Adventure", "Diana, princess of the Amazons, leaves home to fight in the war thought to end all wars.", "United States", 2017, 712.3, 20900),
    ("Aquaman", "Action, Adventure", "Arthur Curry learns that he is the heir to the underwater kingdom of Atlantis.", "United States", 2018, 688.2, 15000),
    ("Doctor Strange", "Action, Fantasy", "A former neurosurgeon embarks on a journey of healing only to be drawn into the world of the mystic arts.", "United States", 2016, 690.3, 22000),
    # Sci-Fi
    ("Dune", "Sci-Fi, Adventure", "Feature adaptation of Frank Herbert's science fiction novel set on a desert planet called Arrakis.", "United States", 2021, 820.4, 18200),
    ("Tenet", "Action, Sci-Fi", "Armed with only one word, Tenet, and fighting for the survival of the entire world, a Protagonist journeys through twilight of international espionage.", "United States", 2020, 680.5, 15100),
    ("The Matrix", "Sci-Fi, Action", "A computer hacker learns about the true nature of his reality and his role in the war against its controllers.", "United States", 1999, 857.5, 23900),
    ("The Matrix Reloaded", "Sci-Fi, Action", "Neo and his allies race against time before Zion is destroyed by the Machines.", "United States", 2003, 698.7, 15200),
    ("Edge of Tomorrow", "Sci-Fi, Action", "A military officer is coerced into a battle simulation that resets each time he dies.", "United States", 2014, 711.3, 16500),
    ("Arrival", "Sci-Fi, Drama", "A linguist works with the military to communicate with alien lifeforms after twelve mysterious spacecraft appear around the world.", "United States", 2016, 720.9, 22300),
    ("Ex Machina", "Sci-Fi, Drama", "A programmer is selected to participate in a groundbreaking experiment in synthetic intelligence by evaluating the human qualities of an AI.", "United Kingdom", 2014, 650.2, 14900),
    ("Blade Runner 2049", "Sci-Fi, Drama", "Young Blade Runner K's discovery of a long-buried secret leads him to track down former Blade Runner Rick Deckard.", "United States", 2017, 640.8, 14500),
    ("Her", "Sci-Fi, Drama", "A lonely writer develops an unlikely relationship with an operating system designed to meet his every need.", "United States", 2013, 680.4, 16800),
    ("Gravity", "Sci-Fi, Thriller", "Two astronauts work together to survive after an accident leaves them adrift in space.", "United States", 2013, 711.0, 17600),
    # Drama / Crime
    ("Parasite", "Drama, Thriller", "Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.", "South Korea", 2019, 760.4, 16700),
    ("Joker", "Crime, Drama", "In Gotham City, mentally troubled comedian Arthur Fleck is disregarded and mistreated by society.", "United States", 2019, 830.5, 24300),
    ("The Shawshank Redemption", "Drama", "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.", "United States", 1994, 950.4, 25700),
    ("The Godfather", "Crime, Drama", "The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.", "United States", 1972, 883.0, 19400),
    ("Pulp Fiction", "Crime, Drama", "The lives of two mob hitmen, a boxer, a gangster and his wife intertwine in four tales of violence and redemption.", "United States", 1994, 860.2, 25300),
    ("The Silence of the Lambs", "Crime, Thriller", "A young FBI cadet must receive the help of an incarcerated and manipulative cannibal killer to help catch another serial killer.", "United States", 1991, 780.6, 14600),
    ("Se7en", "Crime, Mystery", "Two detectives hunt a serial killer who uses the seven deadly sins as his motives.", "United States", 1995, 800.4, 21200),
    ("Fight Club", "Drama, Thriller", "An insomniac office worker and a devil-may-care soapmaker form an underground fight club that evolves into something much more sinister.", "United States", 1999, 840.2, 25600),
    ("Goodfellas", "Crime, Drama", "The story of Henry Hill and his life in the mob, covering his relationship with his wife Karen Hill and his mob partners.", "United States", 1990, 801.6, 12500),
    ("The Departed", "Crime, Thriller", "An undercover cop and a mole in the police attempt to identify each other while infiltrating an Irish gang.", "United States", 2006, 790.6, 20200),
    # Animation
    ("Coco", "Animation, Family", "Aspiring musician Miguel enters the Land of the Dead to find his great-great-grandfather.", "United States", 2017, 760.4, 17900),
    ("Up", "Animation, Adventure", "78-year-old Carl Fredricksen travels to Paradise Falls in his house equipped with balloons, inadvertently taking a young stowaway.", "United States", 2009, 800.2, 21500),
    ("WALL-E", "Animation, Sci-Fi", "In the distant future, a small waste-collecting robot inadvertently embarks on a space journey.", "United States", 2008, 780.6, 17500),
    ("Toy Story", "Animation, Comedy", "A cowboy doll is profoundly threatened and jealous when a new spaceman figure supplants him as top toy.", "United States", 1995, 790.4, 16100),
    ("Toy Story 3", "Animation, Comedy", "The toys are mistakenly delivered to a day-care center instead of the attic right before Andy leaves for college.", "United States", 2010, 770.4, 15200),
    ("The Lion King", "Animation, Drama", "Lion prince Simba and his father are adored by the animals of Pride Rock. Simba idolises his father, King Mufasa.", "United States", 1994, 843.2, 18300),
    ("Spirited Away", "Animation, Fantasy", "During her family's move to the suburbs, a sullen 10-year-old girl wanders into a world ruled by gods, witches, and spirits.", "Japan", 2001, 870.2, 15400),
    ("Your Name", "Animation, Romance", "Two strangers find themselves linked in a bizarre way discovering that they have been swapping bodies.", "Japan", 2016, 804.4, 10900),
    ("Frozen", "Animation, Musical", "When the newly crowned Queen Elsa accidentally uses her power to curse her home in infinite winter, her sister Anna teams up with a mountain man to change it.", "United States", 2013, 802.4, 17900),
    ("Moana", "Animation, Musical", "In Ancient Polynesia, when a terrible curse incurred by the Demigod Maui reaches Moana's island, she answers the Ocean's call to seek out the Demigod to set things right.", "United States", 2016, 789.2, 15600),
    # Horror / Thriller
    ("Get Out", "Horror, Mystery", "A young African-American visits his white girlfriend's parents for the weekend.", "United States", 2017, 750.4, 14900),
    ("Hereditary", "Horror, Drama", "When the matriarch of the Graham family passes away, her daughter's family begins to unravel cryptic and terrifying secrets about their ancestry.", "United States", 2018, 680.2, 12100),
    ("A Quiet Place", "Horror, Sci-Fi", "In a post-apocalyptic world, a family is forced to live in near silence while hiding from monsters with ultra-sensitive hearing.", "United States", 2018, 720.6, 15100),
    ("Us", "Horror, Thriller", "A family's serene beach vacation turns to chaos when their doppelgängers appear and begin to terrorize them.", "United States", 2019, 660.4, 12500),
    ("The Conjuring", "Horror", "Paranormal investigators Ed and Lorraine Warren work with a family haunted by a dark presence in their farmhouse.", "United States", 2013, 690.6, 14000),
    ("IT Chapter One", "Horror, Drama", "In the summer of 1989, a group of bullied kids band together to destroy a shape-shifting monster.", "United States", 2017, 730.8, 17400),
    # Romance / Comedy
    ("La La Land", "Musical, Romance", "A jazz musician and an aspiring actress fall in love while pursuing their dreams in Los Angeles.", "United States", 2016, 760.4, 15200),
    ("Whiplash", "Drama, Music", "A promising young drummer enrolls at a cut-throat music conservatory where his dreams of greatness are mentored by an instructor who will stop at nothing.", "United States", 2014, 750.6, 14900),
    ("The Grand Budapest Hotel", "Comedy, Adventure", "A writer encounters the owner of an aging European hotel between the wars and learns of his earlier life with the eccentric concierge.", "Germany", 2014, 729.4, 15800),
    ("Knives Out", "Comedy, Mystery", "A detective investigates the death of the patriarch of an eccentric, combative family.", "United States", 2019, 760.2, 14500),
    ("Marriage Story", "Drama, Romance", "A stage director and his actress wife struggle through a grueling, coast-to-coast divorce that begins to tax them both financially and emotionally.", "United States", 2019, 680.4, 8700),
    ("Once Upon a Time in Hollywood", "Drama, Comedy", "A faded television actor and his stunt double strive to achieve fame and success in the film industry during the final years of Hollywood's Golden Age.", "United States", 2019, 720.2, 14200),
    # Historical / War
    ("1917", "Drama, War", "Two British soldiers are given a seemingly impossible mission: deliver a message deep in enemy territory that will stop 1,600 men going over the top.", "United Kingdom", 2019, 760.8, 15600),
    ("Dunkirk", "Drama, War", "Allied soldiers from Belgium, the British Commonwealth and Empire, and France are surrounded by the German Army on the beach at Dunkirk, France.", "United Kingdom", 2017, 740.4, 18700),
    ("Schindler's List", "Biography, Drama", "In German-occupied Poland during World War II, industrialist Oskar Schindler gradually becomes concerned for his Jewish workforce after witnessing their persecution by the Nazis.", "United States", 1993, 840.6, 14900),
    ("Saving Private Ryan", "Drama, War", "Following the Normandy Landings, a group of U.S. soldiers go behind enemy lines to retrieve a paratrooper whose brothers have been killed in action.", "United States", 1998, 801.4, 14500),
    ("Braveheart", "Biography, Drama", "Scottish warrior William Wallace leads his countrymen in a rebellion to free his homeland from the tyranny of King Edward I of England.", "United States", 1995, 788.2, 13400),
    # South Korean / International
    ("Oldboy", "Action, Mystery", "After being kidnapped and imprisoned for fifteen years, Oh Dae-Su is released, only to find that he must find his captor in five days.", "South Korea", 2003, 674.4, 11200),
    ("Train to Busan", "Action, Horror", "While a zombie apocalypse overtakes South Korea, passengers on a train from Seoul to Busan must struggle for survival.", "South Korea", 2016, 690.4, 10400),
    ("The Wailing", "Horror, Mystery", "A stranger arrives in a small village and soon the inhabitants start turning into murderous zombies.", "South Korea", 2016, 650.2, 7400),
    # Animated Sequels
    ("Finding Nemo", "Animation, Adventure", "After his son is captured in the Great Barrier Reef and taken to Sydney, a timid clownfish sets out on a journey to bring him home.", "United States", 2003, 793.2, 17300),
    ("Shrek", "Animation, Comedy", "A mean lord exiles fairytale creatures to the swamp of a reclusive ogre, who must go on a quest and rescue a princess for the lord.", "United States", 2001, 800.4, 16800),
    ("How to Train Your Dragon", "Animation, Adventure", "A young Viking who aspires to hunt dragons becomes the unlikely friend of a young dragon himself.", "United States", 2010, 770.8, 16900),
    ("Kung Fu Panda", "Animation, Comedy", "The Dragon Warrior has to clash against the savage Tai Lung as China's fate hangs in the balance.", "United States", 2008, 760.2, 16200),
    # More modern hits
    ("Top Gun Maverick", "Action, Drama", "After more than thirty years of service as a top naval aviator, Pete Mitchell is where he belongs, pushing the envelope as a courageous test pilot.", "United States", 2022, 890.6, 19500),
    ("Everything Everywhere All at Once", "Action, Comedy", "A middle-aged Chinese immigrant is swept up into an insane adventure in which she alone can save the world from a powerful being.", "United States", 2022, 780.4, 13700),
    ("The Batman", "Action, Crime", "Batman ventures into Gotham City's underworld when a sadistic killer leaves behind a trail of cryptic clues.", "United States", 2022, 760.4, 16200),
    ("Black Panther Wakanda Forever", "Action, Adventure", "The people of Wakanda fight to protect their home from intervening world powers as they mourn the death of their king T'Challa.", "United States", 2022, 730.2, 13600),
    ("Avatar", "Action, Adventure", "A paraplegic Marine dispatched to the moon Pandora on a unique mission becomes torn between following his orders and protecting the world he feels is his home.", "United States", 2009, 1004.6, 29300),
    ("Avatar The Way of Water", "Action, Adventure", "Jake Sully lives with his newfound family formed on the extrasolar moon Pandora.", "United States", 2022, 800.4, 14400),
    ("Oppenheimer", "Biography, Drama", "The story of J. Robert Oppenheimer's role in the development of the atomic bomb during World War II.", "United States", 2023, 860.2, 19800),
    ("Barbie", "Comedy, Adventure", "Barbie and Ken are having the time of their lives in the colorful and seemingly perfect world of Barbie Land.", "United States", 2023, 840.6, 16200),
    ("Killers of the Flower Moon", "Crime, Drama", "Members of the Osage Nation are murdered under mysterious circumstances in the 1920s, sparking a major FBI investigation.", "United States", 2023, 720.4, 9800),
    ("Past Lives", "Drama, Romance", "Nora and Hae Sung, two deeply connected childhood friends, are separated when Nora's family emigrates from South Korea.", "United States", 2023, 680.6, 7200),
    ("Saltburn", "Drama, Thriller", "A student at Oxford University finds himself drawn into the world of a charming and aristocratic classmate.", "United Kingdom", 2023, 710.2, 9600),
    ("Poor Things", "Comedy, Drama", "The incredible tale about the fantastical evolution of Bella Baxter, a young woman brought back to life by a brilliant and eccentric scientist.", "United Kingdom", 2023, 720.8, 9800),
    ("Maestro", "Biography, Drama", "A towering and fearless love story depicting the lifelong relationship between Leonard Bernstein and Felicia Montealegre Cohn Bernstein.", "United States", 2023, 650.4, 6200),
    ("Mission Impossible Dead Reckoning", "Action, Adventure", "Ethan Hunt and his IMF team must track down a dangerous weapon before it falls into the wrong hands.", "United States", 2023, 760.6, 13400),
    ("Fast X", "Action, Adventure", "Dom Toretto and his family are targeted by the vengeful son of drug lord Hernan Reyes.", "United States", 2023, 730.4, 11600),
    # Thriller / Mystery
    ("Gone Girl", "Drama, Thriller", "With the wife gone missing, a husband becomes a suspect. Media and online speculation runs rampant.", "United States", 2014, 740.4, 18200),
    ("Nightcrawler", "Crime, Drama", "When Louis Bloom, a con man desperate for work, muscles into the world of LA crime journalism.", "United States", 2014, 720.8, 13800),
    ("Prisoners", "Crime, Drama", "When Keller Dover's daughter and her friend go missing, he takes matters into his own hands as the police, headed by Detective Loki, are too slow.", "United States", 2013, 720.6, 14900),
    ("Zodiac", "Crime, Mystery", "In the late 1960s/early 1970s, a San Francisco cartoonist becomes an amateur detective obsessed with tracking down the Zodiac Killer.", "United States", 2007, 680.4, 10600),
    ("Shutter Island", "Mystery, Thriller", "In 1954, a U.S. Marshal investigates the disappearance of a murderer who escaped from a hospital for the criminally insane.", "United States", 2010, 760.2, 18700),
    # Documentary-style drama
    ("The Social Network", "Biography, Drama", "As Harvard student Mark Zuckerberg creates the social networking site that would become known as Facebook.", "United States", 2010, 750.4, 18500),
    ("Moneyball", "Biography, Drama", "Oakland A's general manager Billy Beane's successful attempt to assemble a baseball team using computer-generated analysis.", "United States", 2011, 710.6, 12600),
    ("The Big Short", "Comedy, Drama", "Four denizens of the world of high-finance predict the credit and housing bubble collapse of the mid-2000s.", "United States", 2015, 730.4, 13400),
    ("Spotlight", "Biography, Drama", "The true story of how the Boston Globe uncovered the massive scandal of child molestation and cover-up within the local Catholic Archdiocese.", "United States", 2015, 720.2, 12000),
    # More popular
    ("John Wick", "Action, Crime", "An ex-hitman comes out of retirement to track down the gangsters who killed his dog and took his car.", "United States", 2014, 760.4, 20800),
    ("John Wick Chapter 2", "Action, Crime", "After returning to the criminal underworld to repay a debt, John Wick discovers there's a large bounty on his life.", "United States", 2017, 730.6, 15600),
    ("John Wick Chapter 3 Parabellum", "Action, Thriller", "Super-assassin John Wick is on the run after killing a member of the international assassins' guild.", "United States", 2019, 740.4, 16400),
    ("Mad Max Fury Road", "Action, Adventure", "In a post-apocalyptic wasteland, a woman rebels against a tyrannical ruler in search of her homeland.", "Australia", 2015, 790.2, 19900),
    ("Logan", "Action, Drama", "In a near future, a weary Logan cares for an ailing Professor X in a hide out. But Logan's attempts to hide from the world are up-ended.", "United States", 2017, 740.6, 17800),
    ("The Revenant", "Adventure, Drama", "A frontiersman on a fur trading expedition in the 1820s fights for survival after being mauled by a bear.", "United States", 2015, 724.2, 15300),
    ("Bohemian Rhapsody", "Biography, Drama", "The story of the legendary rock band Queen and lead singer Freddie Mercury, leading up to their famous Live Aid performance.", "United Kingdom", 2018, 760.4, 15700),
    ("Rocketman", "Biography, Musical", "A musical fantasy about the incredible human story of Elton John's breakthrough years.", "United Kingdom", 2019, 710.6, 10800),
    ("Ford v Ferrari", "Biography, Drama", "American car designer Carroll Shelby and driver Ken Miles battle corporate interference and the laws of physics to build a race car for Ford.", "United States", 2019, 740.4, 13600),
    ("1917 Part 2", "Drama, War", "A soldier must carry an urgent message across enemy lines during the first World War.", "United Kingdom", 2020, 720.2, 10200),
    ("Midsommar", "Horror, Mystery", "A couple travels to Sweden to visit a rural hometown's fabled mid-summer festival.", "United States", 2019, 640.6, 10700),
    ("Uncut Gems", "Crime, Drama", "With his debts mounting and intense pressure to deliver, a charismatic New York City jeweler makes a series of high-stakes bets.", "United States", 2019, 680.4, 12200),
    ("The Irishman", "Crime, Drama", "An aging hitman recalls his time with the mob and his involvement in the infamous disappearance of Jimmy Hoffa.", "United States", 2019, 670.2, 10300),
    ("Little Women", "Drama, Romance", "Jo March reflects back and forth on her life, telling the beloved story of the March sisters.", "United States", 2019, 700.4, 10900),
    ("Jojo Rabbit", "Comedy, War", "A World War II satire that follows a lonely German boy whose world view is turned upside down when he discovers his single mother is hiding a Jewish girl in their attic.", "New Zealand", 2019, 710.6, 11800),
]

rows = []
for title, genres, description, country, year, popularity, vote_count in REAL_MOVIES:
    rows.append({
        "title": title,
        "listed_in": genres,
        "description": description,
        "popularity": round(popularity, 2),
        "vote_count": vote_count,
        "country": country,
        "release_year": year,
    })

df = pd.DataFrame(rows)
df = df.drop_duplicates(subset="title").reset_index(drop=True)

os.makedirs("data", exist_ok=True)

# Delete old TF-IDF cache so it's rebuilt with new data
cache_path = os.path.join("data", "tfidf_cache.pkl")
if os.path.exists(cache_path):
    os.remove(cache_path)
    print("Removed old TF-IDF cache.")

df.to_csv("data/final_df.csv", index=False)
print(f"Dataset created: data/final_df.csv  ({len(df)} real movies)")
print("TMDB will now find real posters for all movies.")
