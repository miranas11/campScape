const mongoose = require("mongoose");
const cities = require("./cities");
const { places, descriptors } = require("./seed_helpers");

const Campground = require("../models/campground");

mongoose.connect("mongodb://127.0.0.1:27017/CampScape");
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("DATABASE CONNECTED");
});

const sample = (arr) => arr[Math.floor(Math.random() * arr.length)];

const seedDB = async () => {
    await Campground.deleteMany();
    for (let i = 0; i < 300; i++) {
        const random100 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            location: `${cities[random100].city}, ${cities[random100].state}`,
            geometry: {
                type: "Point",
                coordinates: [
                    cities[random100].longitude,
                    cities[random100].latitude,
                ],
            },
            title: `${sample(descriptors)} ${sample(places)}`,
            author: "6477a9bd3f8708c568c94cdf",
            description:
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus vehicula ipsum mi, id condimentum libero commodo et. Nulla vel ligula quis nulla blandit dignissim. Curabitur vitae ultricies dolor, rhoncus tempor urna. Maecenas varius consectetur elementum. Ut dapibus, enim sit amet tempus ultrices, turpis justo euismod eros, bibendum viverra leo justo vitae erat. Vivamus sit amet consequat dui. Nam vitae quam purus. Nunc feugiat, eros quis fringilla lobortis, risus augue condimentum ligula, a semper nisi ligula pulvinar ex. Pellentesque ut accumsan quam. Ut mattis rutrum elementum. Nulla euismod tincidunt libero, ac tristique nisl pharetra a. Morbi sapien magna, pretium eget lacus in, congue euismod quam.",
            price,
            images: [
                {
                    url: "https://res.cloudinary.com/daserwxc9/image/upload/v1685292103/YelpCamp/odt3smqtmuimto6ewv2j.jpg",
                    filename: "YelpCamp/odt3smqtmuimto6ewv2j",
                },
                {
                    url: "https://res.cloudinary.com/daserwxc9/image/upload/v1685292114/YelpCamp/olmmwda4xbwjtcl2qash.jpg",
                    filename: "YelpCamp/olmmwda4xbwjtcl2qash",
                },
            ],
        });

        await camp.save();
    }
};

seedDB().then(() => {
    mongoose.connection.close();
});
