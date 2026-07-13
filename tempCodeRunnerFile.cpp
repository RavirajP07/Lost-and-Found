#include <iostream>
#include <vector>
using namespace std;

vector<string> maze = {
    "#############",
    "#P....#....E#",
    "#.##..#..####",
    "#....*......#",
    "#############"
};

int main() {
    int playerX = 1, playerY = 1;
    int score = 0;
    char move;

    while (true) {
        system("cls"); // Use "clear" if on Linux

        // Print Maze
        for (auto row : maze)
            cout << row << endl;

        cout << "\nScore: " << score << endl;
        cout << "Move (W/A/S/D): ";
        cin >> move;

        int newX = playerX;
        int newY = playerY;

        if (move == 'w' || move == 'W')
            newX--;
        else if (move == 's' || move == 'S')
            newX++;
        else if (move == 'a' || move == 'A')
            newY--;
        else if (move == 'd' || move == 'D')
            newY++;

        char next = maze[newX][newY];

        if (next == '#')
            continue;

        if (next == '*')
            score += 10;

        if (next == 'E') {
            maze[playerX][playerY] = '.';
            maze[newX][newY] = 'P';

            system("cls");
            for (auto row : maze)
                cout << row << endl;

            cout << "\n🎉 You Escaped the Maze!\n";
            cout << "Final Score: " << score << endl;
            break;
        }

        maze[playerX][playerY] = '.';
        playerX = newX;
        playerY = newY;
        maze[playerX][playerY] = 'P';
    }

    return 0;
}