# Game Frame

[![Python](https://img.shields.io/badge/python-3.6.2-blue.svg?style=flat-square)](https://www.python.org/downloads/release/python-362/)
[![Django](https://img.shields.io/badge/django-2.2.1-blue.svg?style=flat-square)](https://www.djangoproject.com/)

> #### A Visual Novel Frame Based on Python and Javascript. 

## Overview
Frame
+ Multiple branches
+ Editable story files
+ HP system
+ Online store and shopping cart
+ Lucky draw
+ Travel back in story time line
+ Branch between lines and files
+ Auto-save


## Development
### Test on localhost
+ Install python3 and Django
```python
pip3 install django
```
+ Download this repository.
+ ```cd``` into the working directory (the directory with ```manage.py```), run
```python
python3 manage.py runserver
```
+ Expecting running result:
Starting development server at http://127.0.0.1:8000/
It indicates success.
+ Use chrome browser，go to http://127.0.0.1:8000/moment

### Online game
Deploy
+ uwsgi 7.4.0
+ nginx 1.14.0 (Ubuntu)

### Edit online story
#### The structure of the story file
Story related files are in ```story``` directory. This directory includes the following files:
+ File```1```:  ```chapter 1``` file
+ File```preload```: Speed up the loading speed of pictures. You can copy pictures address into this file (especially pictures in chapter 1). It will recognize ```/static/*/png``` or ```jpg``` pattern automatically. 
#### Basic setting
+ Invite code in login page： default value is ```wsfw```, you can change it in ```view.py```
## Syntax
### Basic Mode
#### Pictures
+ Change background pictures：`b[background_url]`
e.g. `b/static/moment/image/pic/back.jpg`
+ Change left figure picture：`fl[left_figure_url]`
+ Change right figure picture：`fl[right_figure_url]`
+ Change middle figure picture：`fl[right_figure_url]`
+ Hide figure picture：`f[the location of figure]n`
e.g Hide middle figure picture `fcn`
#### Text
+ Word：`v[the word of characters]`
+ Nametag of characters: `t[character name]`
+ Prompt sentence
Change property `!p[ the prompt sentence for changing property]`
New message `!m[the prompt sentence for message]`
#### Audio
+ Background audio：`s[the path of background audio]`
+ Other audios：`S[the path of audio]`
#### Branch to new story
+ Define branches：
```
a[The number of brances]
j[The target line number or story file path for button 1]
[The name for button 1]
j[The target line number or story file path for button 2]
[The name for button 2]
...
```
+ The number of lines to skip in the same story file `js[# line]`
+ Branch into new story file
```
jf[# line number]
[file path]
```
+ Run multiple commands at the same time: ```cC``` tag，The command set should start with ```c``` tag, and end with ```C```. Then it can reach effects like pictures and text changes simultaneously.
e.g
```
c
f/static/moment/image/pic/human.jpg`
b/static/moment/image/pic/back.jpg`
tEmma
vHello, I'm Emma.
C
```
#### Message Box
+ Send a message from characters.
```
m[human name]
[message contens]
```
+ Send a message to characters.
```
m[human name]
u[message contens]
```
#### Change characters property
```
r[total line number for this command set]
*[human name 1]
[l or h or m][+ or -][value]
*e
*[human name 2]
[l or h or m][+ or -][value]
*e
...
```
e.g.
1. Emma's love increases 30
2. Nick's love decreases 30 and money increase 50
```
r7
*Emma
l+30
*e
*Nick
l-30
m+50
*e
```
#### Create Game Element
+ Create Game Characters
```@[human name（system name）]#[title]#[full name]#[simple introduction]#[health]#[love]#[money]#[figure picture path]#[detailed introduction]#[profile picture path]#[background picture path]```
e.g ```@EM#roommate2#Emma#A smiling girl#100#100#100#/static/moment/image/figure/XRQ/2.png#A student in Shanghai Jiao Tong University#/static/moment/image/figure/XRQ/avatar.png#/static/moment/image/pic/places/IMG_2685.JPG```
+ Create trip/gift records
```$[picture path]#[subtitle]#[title]#[introduction]#[human name]#[tag1]#[tag2]#[tag3]```
e.g.
```$/static/moment/image/pic/places/nonsjtu/IMG_3040.JPG#Basketball Game#Intersting Basketball Game with Emma!#I played basketball with Emma Today.....#Emma#happy#fun#sports```

### Film Mode
Note: film mode start with `cf`tag，and end with `Cf`tag. The following commands can be included between these two tags.
+ Change background pictures：`ff[background_url]`
  e.g. `b/static/moment/image/pic/back.jpg`
+ Text：`v)[text content]`
### Attention
+ Every file can be considered as a paragraph for a novel. Don't add a ```\n``` at the end of the file (the last line of story file is not empty).

## Admin Management
Go to http://[ip]/admin
+ Default login account username：admin password：123456
+ Create admin user
    `python manage.py createsuperuser`
+ Delete default admin user
+ Delete game users
    AUTHENTICATION AND AUTHORIZATION -> Users
+ Change Game Records
    + MOMENT -> Story_ file_ statuss
    + The Number of Lucky Draw
    MOMENT -> Daily_ story_ file_ statuss


## Browser
Only support Chrome now.

## Troble Shooting
[Trouble_Shooting](https://github.com/PPER/Webgame/wiki/Trouble-Shooting)


## License
MIT
