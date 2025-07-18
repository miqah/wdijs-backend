import { Injectable, Logger } from "@nestjs/common";
import { SpeechClient } from "@google-cloud/speech";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class GoogleSpeechToTextService{
    private readonly logger = new Logger(GoogleSpeechToTextService.name);
    
    private readonly speechClient: SpeechClient;

    constructor(private readonly configService: ConfigService) {
    try {
      // Initialize the Speech-to-Text client
      // This will use the GOOGLE_APPLICATION_CREDENTIALS environment variable by default
      this.speechClient = new SpeechClient();
      this.logger.log('Google Speech-to-Text client initialized successfully');
    } catch (error) {
      this.logger.error(`Failed to initialize Google Speech-to-Text client: ${error.message}`);
      throw error;
    }
  }

}