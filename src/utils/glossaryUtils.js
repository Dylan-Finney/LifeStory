import LocationIcon from '../assets/glossary/location.svg';
import WorkIcon from '../assets/glossary/work.svg';
import PetIcon from '../assets/glossary/pet.svg';
import ReadingIcon from '../assets/glossary/reading.svg';
import ApplicationIcon from '../assets/glossary/application.svg';
import ArtCraftIcon from '../assets/glossary/art-craft.svg';
import AudioIcon from '../assets/glossary/audio.svg';
import BeautyCraftIcon from '../assets/glossary/beauty-craft.svg';
import BusinessIcon from '../assets/glossary/business.svg';
import CharityIcon from '../assets/glossary/charity.svg';
import CommunityIcon from '../assets/glossary/community.svg';
import CookingIcon from '../assets/glossary/cooking.svg';
import CultureIcon from '../assets/glossary/culture.svg';
import DeviceIcon from '../assets/glossary/device.svg';
import DiningIcon from '../assets/glossary/dining.svg';
import EntertainmentIcon from '../assets/glossary/entertainment.svg';
import EnvironmentIcon from '../assets/glossary/environment.svg';
import FamilyIcon from '../assets/glossary/family.svg';
import FinanceIcon from '../assets/glossary/finance.svg';
import FitnessIcon from '../assets/glossary/fitness.svg';
import GamingIcon from '../assets/glossary/gaming.svg';
import GardeningOutdoorIcon from '../assets/glossary/gardening-outdoor.svg';
import HealthIcon from '../assets/glossary/health.svg';
import HobbyIcon from '../assets/glossary/hobby.svg';
import HomecareIcon from '../assets/glossary/homecare.svg';
import LanguageIcon from '../assets/glossary/language.svg';
import LearningIcon from '../assets/glossary/learning.svg';
import LifestyleIcon from '../assets/glossary/lifestyle.svg';
import LuxuryIcon from '../assets/glossary/luxury.svg';
import MeasureIcon from '../assets/glossary/measure.svg';
import MindIcon from '../assets/glossary/mind.svg';
import ModeIcon from '../assets/glossary/mode.svg';
import MovieIcon from '../assets/glossary/movie.svg';
import MusicIcon from '../assets/glossary/music.svg';
import NutritionIcon from '../assets/glossary/nutrition.svg';
import PersonIcon from '../assets/glossary/person.svg';
import ProjectIcon from '../assets/glossary/project.svg';
import PreferenceIcon from '../assets/glossary/preference.svg';
import RoleIcon from '../assets/glossary/role.svg';
import SafetyIcon from '../assets/glossary/safety.svg';
import SelfImprovementIcon from '../assets/glossary/self-improvement.svg';
import ShoppingIcon from '../assets/glossary/shopping.svg';
import SkillIcon from '../assets/glossary/skill.svg';
import SocialLifeIcon from '../assets/glossary/social-life.svg';
import SpiritualityIcon from '../assets/glossary/spirituality.svg';
import SportIcon from '../assets/glossary/sport.svg';
import TravelIcon from '../assets/glossary/travel.svg';
import TrendsIcon from '../assets/glossary/trends.svg';
import VehicleIcon from '../assets/glossary/vehicle.svg';
import WritingIcon from '../assets/glossary/writing.svg';
import OtherIcon from '../assets/glossary/other.svg';
import {Icon} from '@gluestack-ui/themed';

export const types = [
  'Location',
  'Work',
  'Pet',
  'Place',
  'Application',
  'Art/Craft',
  'Audio',
  'Beauty/Care',
  'Business',
  'Charity',
  'Community',
  'Cooking',
  'Culture',
  'Device',
  'Dining',
  'Entertainment',
  'Environment',
  'Family',
  'Finance',
  'Fitness',
  'Gaming',
  'Gardening/Outdoor',
  'Health',
  'Hobby',
  'Homecare',
  'Language',
  'Learning',
  'Lifestyle',
  'Luxury',
  'Mind',
  'Movie',
  'Music',
  'Nutrition',
  'Project',
  'Reading',
  'Safety',
  'Self-improvement',
  'Shopping',
  'Skill',
  'Social Life',
  'Spirituality',
  'Sport',
  'Travel',
  'Trends',
  'Vehicle',
  'Person',
  'Measure',
  'Mode',
  'Role',
  'Preference',
  'Writing Style',
].sort();

export const getGlossaryTypeIcon = type => {
  switch (type) {
    case 'Location':
      return <Icon as={LocationIcon} />;
    case 'Work':
      return <Icon as={WorkIcon} />;

    case 'Pet':
      return <Icon as={PetIcon} />;
    case 'Place':
      return <Icon as={OtherIcon} />;
    case 'Reading':
      return <Icon as={ReadingIcon} />;
    case 'Application':
      return <Icon as={ApplicationIcon} />;
    case 'Art/Craft':
      return <Icon as={ArtCraftIcon} />;
    case 'Audio':
      return <Icon as={AudioIcon} />;
    case 'Beauty/Care':
      return <Icon as={BeautyCraftIcon} />;
    case 'Business':
      return <Icon as={BusinessIcon} />;
    case 'Charity':
      return <Icon as={CharityIcon} />;
    case 'Community':
      return <Icon as={CommunityIcon} />;
    case 'Cooking':
      return <Icon as={CookingIcon} />;
    case 'Culture':
      return <Icon as={CultureIcon} />;
    case 'Device':
      return <Icon as={DeviceIcon} />;
    case 'Dining':
      return <Icon as={DiningIcon} />;
    case 'Entertainment':
      return <Icon as={EntertainmentIcon} />;
    case 'Environment':
      return <Icon as={EnvironmentIcon} />;
    case 'Family':
      return <Icon as={FamilyIcon} />;
    case 'Finance':
      return <Icon as={FinanceIcon} />;
    case 'Fitness':
      return <Icon as={FitnessIcon} />;
    case 'Gaming':
      return <Icon as={GamingIcon} />;
    case 'Gardening/Outdoor':
      return <Icon as={GardeningOutdoorIcon} />;
    case 'Health':
      return <Icon as={HealthIcon} />;
    case 'Hobby':
      return <Icon as={HobbyIcon} />;
    case 'Homecare':
      return <Icon as={HomecareIcon} />;
    case 'Language':
      return <Icon as={LanguageIcon} />;
    case 'Learning':
      return <Icon as={LearningIcon} />;
    case 'Lifestyle':
      return <Icon as={LifestyleIcon} />;
    case 'Luxury':
      return <Icon as={LuxuryIcon} />;
    case 'Mind':
      return <Icon as={MindIcon} />;
    case 'Movie':
      return <Icon as={MovieIcon} />;
    case 'Music':
      return <Icon as={MusicIcon} />;
    case 'Nutrition':
      return <Icon as={NutritionIcon} />;
    case 'Project':
      return <Icon as={ProjectIcon} />;
    case 'Safety':
      return <Icon as={SafetyIcon} />;
    case 'Self-improvement':
      return <Icon as={SelfImprovementIcon} />;
    case 'Shopping':
      return <Icon as={ShoppingIcon} />;
    case 'Skill':
      return <Icon as={SkillIcon} />;
    case 'Social Life':
      return <Icon as={SocialLifeIcon} />;
    case 'Spirituality':
      return <Icon as={SpiritualityIcon} />;
    case 'Sport':
      return <Icon as={SportIcon} />;
    case 'Travel':
      return <Icon as={TravelIcon} />;
    case 'Trends':
      return <Icon as={TrendsIcon} />;
    case 'Vehicle':
      return <Icon as={VehicleIcon} />;
    case 'Person':
      return <Icon as={PersonIcon} />;
    case 'Measure':
      return <Icon as={MeasureIcon} />;
    case 'Mode':
      return <Icon as={ModeIcon} />;
    case 'Role':
      return <Icon as={RoleIcon} />;
    case 'Preference':
      return <Icon as={PreferenceIcon} />;
    case 'Writing Style':
      return <Icon as={WritingIcon} />;
    default:
      return <Icon as={OtherIcon} />;
  }
};

export const getPlaceHolder = type => {
  switch (type) {
    case 'Location':
      return {alias: 'Home', data: '123 Maple Street, Springfield'};
    case 'Work':
      return {alias: 'Primary Work', data: 'Prifina'};

    case 'Pet':
      return {alias: 'My Cat', data: 'Edgar'};
    case 'Place':
      return {alias: 'Yoga Studio', data: 'Zen Harmony Yoga'};
    case 'Reading':
      return {
        alias: `'1984' by George Orwell`,
        data: 'A book that profoundly shaped my views on politics and society',
      };
    case 'Application':
      return {
        alias: `Trello`,
        data: 'Central hub for my projects and to-do lists.',
      };
    case 'Art/Craft':
      return {
        alias: `Handmade Pottery Vase`,
        data: 'First piece I created in pottery class, symbolizing my growth.',
      };
    case 'Audio':
      return {
        alias: `'The Daily' Podcast`,
        data: 'My go-to for daily news during my morning routine.',
      };
    case 'Beauty/Care':
      return {
        alias: `Cetaphil Gentle Skin Cleanser`,
        data: 'A staple in my skincare routine for gentle cleansing.',
      };
    case 'Business':
      return {
        alias: `LinkedIn Networking`,
        data: 'My primary platform for professional growth.',
      };
    case 'Charity':
      return {
        alias: `Local Animal Shelter Donation`,
        data: 'Reflects my commitment to animal welfare.',
      };
    case 'Community':
      return {
        alias: `Community Gardening Club`,
        data: 'Connects me with neighbors and local greening efforts.',
      };
    case 'Cooking':
      return {
        alias: `Family Heirloom Recipe Book`,
        data: `Traditional and experimental cooking from my family's heritage.`,
      };
    case 'Culture':
      return {
        alias: `Annual Local Film Festival`,
        data: 'My yearly escape into world cinema and cultural exploration.',
      };
    case 'Device':
      return {
        alias: `Kindle Paperwhite`,
        data: 'My constant companion for reading and exploring new books.',
      };
    case 'Dining':
      return {
        alias: `'The Green Vegan'`,
        data: 'My favorite spot for plant-based meals.',
      };
    case 'Entertainment':
      return {
        alias: `Netflix Subscription`,
        data: 'Main source of movies and series for relaxation.',
      };
    case 'Environment':
      return {
        alias: `Reusable Shopping Bags`,
        data: 'My step towards reducing plastic use.',
      };
    case 'Family':
      return {
        alias: `Family Game Night`,
        data: 'Weekly quality time with my family.',
      };
    case 'Finance':
      return {
        alias: `Budgeting App`,
        data: 'Keeping track of my monthly expenses.',
      };
    case 'Fitness':
      return {
        alias: `Weekly Yoga Classes`,
        data: 'Essential for my physical health and mental balance.',
      };
    case 'Gaming':
      return {
        alias: `'The Witcher 3'`,
        data: 'Immersive role-playing game I enjoy for storytelling.',
      };
    case 'Gardening/Outdoor':
      return {
        alias: `Vegetable Garden`,
        data: 'My effort towards sustainable living and organic eating.',
      };
    case 'Health':
      return {
        alias: `Gym Membership`,
        data: 'Key to maintaining my fitness and stress relief.',
      };
    case 'Hobby':
      return {
        alias: `Model Building`,
        data: 'Relaxing hobby that enhances my creativity and patience.',
      };
    case 'Homecare':
      return {
        alias: `Smart Home System`,
        data: 'Convenience and efficiency in daily home management.',
      };
    case 'Language':
      return {
        alias: `Spanish Language Classes`,
        data: 'Preparing for my trip to Spain and cultural immersion.',
      };
    case 'Learning':
      return {
        alias: `Online Photography Course`,
        data: 'Enhancing my skills in digital photography.',
      };
    case 'Lifestyle':
      return {
        alias: `Minimalism`,
        data: `Simplifying life to focus on what's truly important.`,
      };
    case 'Luxury':
      return {
        alias: `Rolex Watch`,
        data: 'A family heirloom that symbolizes tradition and timelessness.',
      };
    case 'Mind':
      return {
        alias: `Meditation App`,
        data: 'Daily practice for mental clarity and stress reduction.',
      };
    case 'Movie':
      return {
        alias: `'Inception'`,
        data: 'Film that inspires my love for complex storytelling.',
      };
    case 'Music':
      return {
        alias: `Jazz Vinyl Collection`,
        data: 'Exploring the depth and history of jazz music.',
      };
    case 'Nutrition':
      return {
        alias: `Plant-Based Diet`,
        data: 'Commitment to health and ethical food choices.',
      };
    case 'Project':
      return {
        alias: `Home Renovation`,
        data: 'Transforming my space to reflect my personal style and comfort.',
      };
    case 'Safety':
      return {
        alias: `Home Fire Extinguisher`,
        data: 'Ensuring safety and preparedness in my home.',
      };
    case 'Self-improvement':
      return {
        alias: `Daily Meditation`,
        data: 'Key practice for my mental well-being and personal development.',
      };
    case 'Shopping':
      return {
        alias: `Local Farmer's Market`,
        data: 'My go-to place for fresh, organic produce.',
      };
    case 'Skill':
      return {
        alias: `Digital Marketing Course`,
        data: 'Enhancing my career skills for the digital age.',
      };
    case 'Social Life':
      return {
        alias: `Weekly Dinner with Friends`,
        data: 'Cherished time for socializing and relaxation.',
      };
    case 'Spirituality':
      return {
        alias: `Yoga Retreat`,
        data: 'A space for spiritual rejuvenation and peace.',
      };
    case 'Sport':
      return {
        alias: `Local Soccer Team Membership`,
        data: 'Combining fitness with my passion for soccer.',
      };
    case 'Travel':
      return {
        alias: `Backpacking Trip through Europe`,
        data: 'A journey of discovery and personal growth.',
      };
    case 'Trends':
      return {
        alias: `Electric Scooter`,
        data: 'Embracing eco-friendly urban commuting trends.',
      };
    case 'Vehicle':
      return {
        alias: `Hybrid Car`,
        data: 'A step towards environmentally conscious driving.',
      };
    case 'Person':
      return {
        alias: `Jane Smith (Mentor)`,
        data: 'A guiding influence in my professional journey.',
      };
    case 'Measure':
      return {
        alias: `Weekly Running Distance`,
        data: 'Tracking my progress in fitness goals.',
      };
    case 'Mode':
      return {
        alias: `Public Transit Commuting`,
        data: 'My choice for daily travel to reduce carbon footprint.',
      };
    case 'Role':
      return {
        alias: `Volunteer Coordinator`,
        data: 'Role that allows me to give back to the community.',
      };
    case 'Preference':
      return {
        alias: `Morning Coffee Routine`,
        data: 'A cherished daily ritual for a positive start.',
      };
    case 'Writing Style':
      return {
        alias: `Creative Nonfiction`,
        data: 'My preferred writing style for expressing real-life stories.',
      };
    default:
      return {alias: 'Identifier', data: 'Personal Meaning'};
  }
};
