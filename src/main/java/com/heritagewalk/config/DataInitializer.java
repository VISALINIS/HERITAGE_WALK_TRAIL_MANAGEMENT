package com.heritagewalk.config;

import com.heritagewalk.model.*;
import com.heritagewalk.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private HeritageSiteRepository heritageSiteRepository;

    @Autowired
    private TrailRepository trailRepository;

    @Autowired
    private TrailStopRepository trailStopRepository;

    @Autowired
    private FeedbackRepository feedbackRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.count() > 0) {
            logger.info("Database already contains data. Skipping initial seeding.");
            return;
        }

        logger.info("Starting database initialization with sample heritage data...");

        // 1. Seed Users
        User admin = new User("System Administrator", "admin@heritagewalk.com",
                passwordEncoder.encode("Admin@123"), Role.ADMIN);
        User visitor1 = new User("Priya Sharma", "visitor@heritagewalk.com",
                passwordEncoder.encode("Visitor@123"), Role.VISITOR);
        User visitor2 = new User("Arun Kumar", "arun@example.com",
                passwordEncoder.encode("Visitor@123"), Role.VISITOR);
        User visitor3 = new User("Sneha Patel", "sneha@example.com",
                passwordEncoder.encode("Visitor@123"), Role.VISITOR);

        userRepository.saveAll(List.of(admin, visitor1, visitor2, visitor3));
        logger.info("Seeded default users: Admin (admin@heritagewalk.com) and Visitors.");

        // 2. Seed Heritage Sites (9 Sites)
        HeritageSite tajMahal = new HeritageSite(
                "Taj Mahal",
                "Agra, Uttar Pradesh",
                "An immense mausoleum of white marble, built in Agra between 1631 and 1648 by order of the Mughal emperor Shah Jahan in memory of his favourite wife. It is universally admired as one of the masterpieces of the world's heritage.",
                "Mughal Empire (17th Century)",
                "Mughal Architecture",
                "Recognized as a UNESCO World Heritage Site in 1983 and one of the New Seven Wonders of the World.",
                "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=80",
                27.1751,
                78.0421
        );

        HeritageSite redFort = new HeritageSite(
                "Red Fort (Lal Qila)",
                "Old Delhi, Delhi",
                "The historic walled citadel built by Mughal Emperor Shah Jahan when he decided to shift his capital from Agra to Delhi. Built of red sandstone, it represents the zenith of Mughal architectural innovation.",
                "Mughal Empire (1638–1648)",
                "Indo-Islamic Mughal Style",
                "UNESCO World Heritage Site and the symbolic centerpiece of India's Independence Day celebrations.",
                "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1200&q=80",
                28.6562,
                77.2410
        );

        HeritageSite qutubMinar = new HeritageSite(
                "Qutub Minar",
                "Mehrauli, New Delhi",
                "A 73-metre high tower of victory, built in 1193 by Qutab-ud-din Aibak immediately after the defeat of Delhi's last Hindu kingdom. The tower has five distinct storeys, each marked by a projecting balcony.",
                "Delhi Sultanate (1192–1220)",
                "Indo-Islamic Afghan Architecture",
                "The tallest brick minaret in the world and one of the earliest Islamic monuments in South Asia.",
                "https://images.unsplash.com/photo-1598324789736-4861f89564a0?auto=format&fit=crop&w=1200&q=80",
                28.5245,
                77.1855
        );

        HeritageSite virupakshaTemple = new HeritageSite(
                "Virupaksha Temple",
                "Hampi, Karnataka",
                "Located in Hampi on the banks of the Tungabhadra River, this temple is dedicated to Lord Shiva as Virupaksha. It has remained an active place of worship since its inception in the 7th century.",
                "Vijayanagara Empire (14th–16th Century)",
                "Dravidian Temple Architecture",
                "Part of the Group of Monuments at Hampi, a UNESCO World Heritage Site celebrating ancient craft.",
                "https://images.unsplash.com/photo-1600100397608-f010f443b764?auto=format&fit=crop&w=1200&q=80",
                15.3350,
                76.4600
        );

        HeritageSite meenakshiTemple = new HeritageSite(
                "Meenakshi Amman Temple",
                "Madurai, Tamil Nadu",
                "A historic Hindu temple located on the southern bank of the Vaigai River in the temple city of Madurai. The complex houses 14 gateway towers (gopurams), ranging from 45–50m in height.",
                "Pandya & Nayak Dynasties (6th–17th Century)",
                "Dravidian Architecture",
                "Renowned for its breathtaking sculptured gopurams and the celebrated Thousand Pillar Hall.",
                "https://images.unsplash.com/photo-1609137144813-7d9921338f24?auto=format&fit=crop&w=1200&q=80",
                9.9195,
                78.1193
        );

        HeritageSite mysorePalace = new HeritageSite(
                "Mysore Palace (Amba Vilas)",
                "Mysuru, Karnataka",
                "The official residence of the Wadiyar dynasty and the seat of the Kingdom of Mysore. Facing the Chamundi Hills, the palace is renowned for its grand arches, opulent interiors, and golden throne.",
                "Kingdom of Mysore (1897–1912)",
                "Indo-Saracenic Revival",
                "One of the most famous tourist attractions in India, illuminated with nearly 100,000 bulbs on festivals.",
                "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=1200&q=80",
                12.3051,
                76.6551
        );

        HeritageSite ajantaCaves = new HeritageSite(
                "Ajanta Caves",
                "Chhatrapati Sambhajinagar, Maharashtra",
                "A series of 30 rock-cut Buddhist cave monuments dating from the 2nd century BCE to about 480 CE. The caves include paintings and rock-cut sculptures described as among the finest surviving examples of ancient Indian art.",
                "Satavahana & Vakataka Dynasties",
                "Ancient Indian Rock-cut Architecture",
                "UNESCO World Heritage Site safeguarding priceless Buddhist frescoes, chaityas, and viharas.",
                "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80",
                20.5519,
                75.7033
        );

        HeritageSite victoriaMemorial = new HeritageSite(
                "Victoria Memorial",
                "Kolkata, West Bengal",
                "A large marble building dedicated to Queen Victoria, located on the Maidan in Kolkata. Built using white Makrana marble, the memorial is surrounded by 64 acres of lush landscaped gardens.",
                "British Colonial Period (1906–1921)",
                "Indo-Saracenic & British Classical",
                "A premier cultural museum and landmark preserving vast collections of historical paintings and artefacts.",
                "https://images.unsplash.com/photo-1558431382-27e303142255?auto=format&fit=crop&w=1200&q=80",
                22.5448,
                88.3426
        );

        HeritageSite gatewayOfIndia = new HeritageSite(
                "Gateway of India",
                "Mumbai, Maharashtra",
                "An arch-monument built during the 20th century in Mumbai to commemorate the landing of King George V and Queen Mary. It overlooks the Arabian Sea and serves as a symbolic entrance to India.",
                "British Colonial Period (1911–1924)",
                "Indo-Saracenic with 16th-century Gujarati influences",
                "Historic monument that marked the ceremonial exit of the last British troops from independent India in 1948.",
                "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=1200&q=80",
                18.9220,
                72.8347
        );

        List<HeritageSite> sites = heritageSiteRepository.saveAll(List.of(
                tajMahal, redFort, qutubMinar, virupakshaTemple, meenakshiTemple,
                mysorePalace, ajantaCaves, victoriaMemorial, gatewayOfIndia
        ));
        logger.info("Seeded {} heritage sites.", sites.size());

        // 3. Seed Trails
        Trail trail1 = new Trail(
                "Mughal Architecture & Forts Trail",
                "A curated historical trail tracing the heights of Mughal architectural genius, from the walled citadel of Shahjahanabad in Delhi to the sublime marble poetry of the Taj Mahal in Agra.",
                "Red Fort Lahori Gate, Old Delhi",
                "Taj Mahal East Gate, Agra",
                14.5,
                240,
                Difficulty.MODERATE,
                "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1200&q=80"
        );

        Trail trail2 = new Trail(
                "Dravidian Temple & Dynasty Heritage Walk",
                "Immerse yourself in centuries of living spiritual traditions, soaring carved gopurams, monolithic pillared corridors, and royal architecture across Karnataka and Tamil Nadu.",
                "Meenakshi Amman East Gopuram, Madurai",
                "Amba Vilas Palace Main Arch, Mysuru",
                9.2,
                180,
                Difficulty.EASY,
                "https://images.unsplash.com/photo-1609137144813-7d9921338f24?auto=format&fit=crop&w=1200&q=80"
        );

        Trail trail3 = new Trail(
                "Imperial Monuments & Colonial Architecture Circuit",
                "Explore the confluence of Indo-Saracenic design, grand classical porticos, and maritime heritage spanning the coastal gateway of Mumbai to Kolkata's grand marble memorial.",
                "Gateway of India Promenade, Mumbai",
                "Victoria Memorial Gardens, Kolkata",
                18.0,
                300,
                Difficulty.HARD,
                "https://images.unsplash.com/photo-1558431382-27e303142255?auto=format&fit=crop&w=1200&q=80"
        );

        trailRepository.saveAll(List.of(trail1, trail2, trail3));
        logger.info("Seeded 3 curated heritage walking trails.");

        // 4. Seed Trail Stops
        List<TrailStop> stops = new ArrayList<>();
        // Trail 1 stops
        stops.add(new TrailStop(trail1, redFort, 1));
        stops.add(new TrailStop(trail1, qutubMinar, 2));
        stops.add(new TrailStop(trail1, tajMahal, 3));

        // Trail 2 stops
        stops.add(new TrailStop(trail2, meenakshiTemple, 1));
        stops.add(new TrailStop(trail2, virupakshaTemple, 2));
        stops.add(new TrailStop(trail2, mysorePalace, 3));

        // Trail 3 stops
        stops.add(new TrailStop(trail3, gatewayOfIndia, 1));
        stops.add(new TrailStop(trail3, ajantaCaves, 2));
        stops.add(new TrailStop(trail3, victoriaMemorial, 3));

        trailStopRepository.saveAll(stops);
        logger.info("Seeded trail stops linking trails to heritage sites.");

        // 5. Seed Visitor Feedback for immediate realistic analytics
        List<Feedback> feedbackList = List.of(
                new Feedback(visitor1, tajMahal, 5, "Breathtaking beauty, especially at sunrise! The symmetry and marble craftsmanship are unmatched."),
                new Feedback(visitor2, tajMahal, 5, "A truly awe-inspiring monument. The surrounding gardens and Yamuna view are mesmerizing."),
                new Feedback(visitor3, tajMahal, 4, "Magnificent site. Can get crowded during afternoons, so arriving early is highly recommended."),
                new Feedback(visitor1, redFort, 4, "Rich history and incredible sandstone walls. The evening sound and light show is worth watching."),
                new Feedback(visitor2, redFort, 5, "Walking through the Diwan-i-Khas and Diwan-i-Aam felt like stepping directly back into the Mughal court."),
                new Feedback(visitor3, qutubMinar, 5, "Astonishing engineering from the 12th century. The intricate calligraphy on each tier is fascinating."),
                new Feedback(visitor1, qutubMinar, 4, "Very well maintained complex with clear interpretive plaques. The Iron Pillar is a wonder."),
                new Feedback(visitor2, virupakshaTemple, 5, "The spiritual aura and boulder-strewn Hampi landscape make this an unforgettable experience."),
                new Feedback(visitor3, virupakshaTemple, 5, "Incredible Dravidian stone carvings and ancient atmosphere. A dream for heritage enthusiasts."),
                new Feedback(visitor1, meenakshiTemple, 5, "The scale and colors of the Gopurams are stunning. The Hall of Thousand Pillars is mesmerizing."),
                new Feedback(visitor2, meenakshiTemple, 4, "Deeply spiritual and lively. Make sure to visit during early evening pooja for the best experience."),
                new Feedback(visitor3, mysorePalace, 5, "The illuminated night view of the palace on Sunday is one of the grandest spectacles in India!"),
                new Feedback(visitor1, mysorePalace, 4, "Opulent royal interiors with Belgian stained glass and carved teakwood ceilings."),
                new Feedback(visitor2, ajantaCaves, 5, "Timeless Buddhist mural paintings that survived over two millennia. Truly humbling."),
                new Feedback(visitor3, victoriaMemorial, 4, "Stately British classical architecture with peaceful gardens and interesting colonial gallery exhibits."),
                new Feedback(visitor1, gatewayOfIndia, 3, "Historic waterfront monument with great harbor breeze. Very crowded on weekends.")
        );

        feedbackRepository.saveAll(feedbackList);
        logger.info("Seeded {} visitor feedback entries.", feedbackList.size());
        logger.info("Database seeding completed successfully!");
    }
}

