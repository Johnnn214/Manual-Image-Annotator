
-- Create the Users table
CREATE TABLE Users (
    UserID INT AUTO_INCREMENT PRIMARY KEY,
    Username VARCHAR(255),
    Password VARCHAR(255)
);

-- Create the Client table
CREATE TABLE Client (
    ClientID INT AUTO_INCREMENT PRIMARY KEY,
    UserID INT,
    FOREIGN KEY (UserID) REFERENCES Users(UserID)
);

-- Create the Admin table
CREATE TABLE Admin (
    AdminID INT AUTO_INCREMENT PRIMARY KEY,
    UserID INT,
    FOREIGN KEY (UserID) REFERENCES Users(UserID)
);

-- Create the Collection table
CREATE TABLE Collection (
    CollectionID INT AUTO_INCREMENT PRIMARY KEY,
    CollectionName VARCHAR(255)
);

-- Create the Image table
CREATE TABLE Image (
    ImageID INT AUTO_INCREMENT PRIMARY KEY,
    CollectionID INT,
    ImageName VARCHAR(255),
    ImageURL VARCHAR(255),
    FOREIGN KEY (CollectionID) REFERENCES Collection(CollectionID)
);

-- Create the Label table
CREATE TABLE Label (
    LabelID INT AUTO_INCREMENT PRIMARY KEY,
    LabelName VARCHAR(255),
    CollectionID INT,
    LabelImageSource VARCHAR(255),
    FOREIGN KEY (CollectionID) REFERENCES Collection(CollectionID)
);

-- Create the Sub_Label table
CREATE TABLE Sub_Label (
    Sub_LabelID INT AUTO_INCREMENT PRIMARY KEY,
    Sub_LabelName VARCHAR(255),
    LabelID INT,
	Sub_LabelImageSource VARCHAR(255),
    FOREIGN KEY (LabelID) REFERENCES Label(LabelID)
);

-- Create the Annotation table
CREATE TABLE Annotation (
    AnnotationID INT AUTO_INCREMENT PRIMARY KEY,
    ClientID INT,
    CollectionID INT,
    ImageID INT,
    LabelID INT,
    Sub_LabelID INT,  
	startX INT,
    startY INT,
    width INT,
    height INT,
    FOREIGN KEY (CollectionID) REFERENCES Collection(CollectionID),
    FOREIGN KEY (ClientID) REFERENCES Client(ClientID),
    FOREIGN KEY (ImageID) REFERENCES Image(ImageID),
    FOREIGN KEY (LabelID) REFERENCES Label(LabelID),
    FOREIGN KEY (Sub_LabelID) REFERENCES Sub_Label(Sub_LabelID)
);

-- Create the Permission table
CREATE TABLE Permission (
    PermissionID INT AUTO_INCREMENT PRIMARY KEY,
    CollectionID INT,
    ClientID INT,
    IsPermited BIT,
    FOREIGN KEY (CollectionID) REFERENCES Collection(CollectionID),
    FOREIGN KEY (ClientID) REFERENCES Client(ClientID)
);

