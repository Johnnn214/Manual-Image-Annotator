
--Demo Data
-- Insert data into the Users table
INSERT INTO Users (UserID, Username, Password)
VALUES (1, 'user1', 'password1'),
       (2, 'user2', 'password2'),
       (3, 'user3', 'password3'),
       (4, 'user4', 'password4'),
       (5, 'user5', 'password5'),
       (6, 'user6', 'password6'),
       (7, 'user7', 'password7'),
       (8, 'user8', 'password8'),
       (9, 'user9', 'password9'),
       (10, 'user10', 'password10');

-- Insert data into the Client table
INSERT INTO Client (ClientID, UserID)
VALUES (1, 2),
       (2, 3),
       (3, 4),
       (4, 5),
       (5, 6),
       (6, 7),
       (7, 8),
       (8, 9),
       (9, 10);

-- Insert data into the Admin table
INSERT INTO Admin (AdminID, UserID)
VALUES (1, 1);

-- Insert data into the Collection table
INSERT INTO Collection (CollectionID, CollectionName)
VALUES (1, 'Collection1');


-- Insert data into the Image table
INSERT INTO Image (ImageID, CollectionID, ImageName, ImageURL)
VALUES (1, 1, 'Image1', 'uploads\collectionimages\1717768814393-bird-small.jpg'),
       (2, 1, 'Image2', 'uploads\collectionimages\1717768814394-emu.jpg'),
       (3, 1, 'Image3', 'uploads\collectionimages\1717768814394-kangaroo.jpeg'),
       (4, 1, 'Image4', 'uploads\collectionimages\1717768814396-koala.jpeg'),
       (5, 1, 'Image5', 'uploads\collectionimages\1717768814396-kooaburra.jpg'),
		(6, 1, 'Image6', 'uploads\collectionimages\1717768814397-tasmanian.jpeg');

-- Insert data into the Label table
INSERT INTO Label (LabelID, LabelName, CollectionID, LabelImageSource)
VALUES (1, 'Label1', 1, 'uploads\labelimages\1717769709240-tasmanian.jpeg' ),
       (2, 'Label2', 1, 'uploads\labelimages\1717770249087-kooaburra.jpg'  ),
       (3, 'Label3', 1, 'uploads\labelimages\1717770253825-kangaroo.jpeg' );


-- Insert data into the Sub_Label table
INSERT INTO Sub_Label (Sub_LabelID, Sub_LabelName,LabelID, Sub_LabelImageSource)
VALUES (1, 'SubLabel1', 1 ,'uploads\sublabelimages\1717770050873-tasmanian.jpeg' ),
       (2, 'SubLabel2', 2, 'uploads\sublabelimages\1717770274743-kooaburra.jpg' ),
       (3, 'SubLabel3', 3, 'uploads\sublabelimages\1717770286629-kangaroo.jpeg' );


-- Insert permission data for each client and collection
INSERT INTO Permission (CollectionID, ClientID, IsPermited)
SELECT CollectionID, ClientID, 0
FROM Collection
CROSS JOIN Client;


