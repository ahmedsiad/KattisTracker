# Kattis Tracker

This is the repository for the browser extension Kattis Tracker, the extension that tracks your solutions to Kattis problems and automatically uploads
them to a GitHub repository of your choice. If you like the extension, please feel free to star this repository.

## Demo Video

Here is a demo video of how the extension works:

https://user-images.githubusercontent.com/63379888/170574632-0884f8a5-ff30-49e6-9b47-cd3746b21eee.mp4

All of this happens in the background, no confirmation needed! 

Here are some screenshots of the popup portion of the extension where you can view your stats and change your settings.

![Screenshot_1](https://user-images.githubusercontent.com/63379888/170574877-1cc93511-7b5f-460a-a969-f758f8279951.png)
![Screenshot_2](https://user-images.githubusercontent.com/63379888/170574890-bff40dfe-d025-47ba-807d-15bbb21bc2f6.png)

## Contributing

To contribute to this repository, feel free to make a pull request and I will try my best to review it soon.

### Installation

1. First, fork this repository and clone it to your computer.
2. You will need to create an OAuth GitHub app and use your app's client id and secret [here](https://github.com/ahmedsiad/KattisTracker/blob/master/public/auth.js).
3. Type `npm run build` into your terminal at the root of the project directory.
4. Go to chrome://extensions and enable developer mode.
5. Press "load unpacked" and select the build folder that should have been created from step 3.
6. The extension should be loaded and you can now start developing!
