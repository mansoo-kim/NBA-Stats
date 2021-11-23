# NBA Stats

# Background

NBA Stats is a visualization app for NBA players' per-game statistics. It shows stats for the some of the most recent NBA seasons. The scatter plot also distinguishes players that were All-Stars for that season. User can select a number of stats to train a machine learning model to see if those stats are good predictors for player getting selected as an All-Star.

# Functionality & MVPs

Users will be able to:
- select different stats for each axis of the scatter plot
- select stats to train a machine learning model to predict All-Star status

# Wireframe

![Wireframe Image](/src/assets/images/wireframe.png)

# Technologies, Libraries

- NBA players statistics from [basketball-reference.com](https://www.basketball-reference.com)
- Javascript for managing data and making app interactive
- D3 library for rendering and visualization
- Machine learning library to train and test model based on user-selected statistics (undecided which library)

# Implementation Timeline

Day 1
- Learn how to use D3 library to create interactive scatter plots
- Finalize the datasets to be used in the app

Day 2
- Finish scatter plots and add interactivity
- Research and determine which JavaScript machine learning library to use

Day 3
- Create pre-trained demo models that can be showcased before users make their own selections
- Implement functionality to allow users to select stats to test if they are good predictors of a player getting selected as an All-Star
- Train a model based on user-selected features/stats and display how the model did at predicting All-Star status

Day 4
- Add CSS and styling to app
