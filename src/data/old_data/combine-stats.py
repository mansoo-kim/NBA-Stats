import pandas as pd
import json

years = [2021, 2020, 2019, 2018, 2017]

with open('all-stars.json') as json_data:
    all_stars_dict = json.load(json_data)

for year in years:
    # Read in two csvs
    per_game = pd.read_csv("{}-{}-per-game.csv".format(year-1, year))
    advanced = pd.read_csv("{}-{}-advanced.csv".format(year-1, year))

    # Drop duplicate/unecessary columns in advanced csv
    advanced.drop(['Rk', 'Pos', 'Age', 'Tm', 'G', 'MP', 'Unnamed: 19', 'Unnamed: 24'], axis=1, inplace=True)

    # Merge/Join two csvs
    merged = per_game.merge(advanced, on="Player")

    # Format Player name properly
    merged['Player'] = merged['Player'].map(lambda x: x.split('\\')[0])

    # Set All-Star status
    merged["All-Star"] = "false"
    merged.loc[merged['Player'].isin(all_stars_dict[str(year)]), "All-Star"] = "true"

    # Save the combined stats to csv
    merged.to_csv("../{}-{}-stats.csv".format(year-1, year), index=False)
