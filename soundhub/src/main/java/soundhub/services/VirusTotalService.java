package soundhub.services;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class VirusTotalService {

    @Value("${virustotal.api.key}")
    private String apiKey;

    @Value("${virustotal.enabled:true}")
    private boolean enabled;

    @Value("${virustotal.max-attempts:30}")
    private int maxAttempts;

    @Value("${virustotal.wait-time-ms:3000}")
    private int waitTimeMs;

    private static final String UPLOAD_URL = "https://www.virustotal.com/api/v3/files";
    private static final String ANALYSIS_URL = "https://www.virustotal.com/api/v3/analyses/";

    private final RestTemplate restTemplate;

    public boolean isFileSafe(MultipartFile file) throws IOException, InterruptedException {
        // If VirusTotal is disabled, skip scanning
        if (!enabled) {
            System.out.println("VirusTotal scanning is disabled. Skipping scan.");
            return true;
        }

        System.out.println("=== VirusTotal Scan Started ===");
        System.out.println("File: " + file.getOriginalFilename());
        System.out.println("Size: " + file.getSize() + " bytes");
        System.out.println("Max attempts: " + maxAttempts);
        System.out.println("Wait time: " + waitTimeMs + "ms");
        
        String analysisId = uploadFile(file);
        System.out.println("Analysis ID: " + analysisId);
        
        boolean isSafe = checkAnalysisResult(analysisId);
        System.out.println("Scan result: " + (isSafe ? "SAFE" : "MALICIOUS"));
        System.out.println("=== VirusTotal Scan Completed ===");
        
        return isSafe;
    }

    private String uploadFile(MultipartFile file) throws IOException {
        HttpHeaders headers = new HttpHeaders();
        headers.set("x-apikey", apiKey);
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("file", new MultipartInputStreamFileResource(file.getInputStream(), file.getOriginalFilename()));

        HttpEntity<MultiValueMap<String, Object>> request = new HttpEntity<>(body, headers);

        ResponseEntity<Map> response = restTemplate.exchange(
                UPLOAD_URL,
                HttpMethod.POST,
                request,
                Map.class
        );

        Map data = (Map) response.getBody().get("data");
        return (String) data.get("id"); // analysis ID
    }

    private boolean checkAnalysisResult(String analysisId) throws InterruptedException {
        for (int i = 0; i < maxAttempts; i++) {
            System.out.println("Checking analysis status... Attempt " + (i + 1) + "/" + maxAttempts);

            HttpHeaders headers = new HttpHeaders();
            headers.set("x-apikey", apiKey);

            HttpEntity<Void> requestEntity = new HttpEntity<>(headers);

            ResponseEntity<Map> response = restTemplate.exchange(
                    ANALYSIS_URL + analysisId,
                    HttpMethod.GET,
                    requestEntity,
                    Map.class
            );

            Map data = (Map) response.getBody().get("data");
            Map attributes = (Map) data.get("attributes");

            String status = (String) attributes.get("status");
            System.out.println("Status: " + status);

            if (status.equals("completed")) {
                Map stats = (Map) attributes.get("stats");

                int malicious = (int) stats.getOrDefault("malicious", 0);
                int suspicious = (int) stats.getOrDefault("suspicious", 0);

                System.out.println("Malicious: " + malicious);
                System.out.println("Suspicious: " + suspicious);

                return malicious == 0 && suspicious == 0;
            }

            // Wait before next check
            System.out.println("Waiting " + (waitTimeMs / 1000) + " seconds before next check...");
            Thread.sleep(waitTimeMs);
        }

        System.err.println("VirusTotal analysis timed out after " + (maxAttempts * waitTimeMs / 1000) + " seconds");
        throw new RuntimeException("VirusTotal analysis timed out");
    }

    static class MultipartInputStreamFileResource extends InputStreamResource {

        private final String filename;

        MultipartInputStreamFileResource(InputStream inputStream, String filename) {
            super(inputStream);
            this.filename = filename;
        }

        @Override
        public String getFilename() {
            return this.filename;
        }

        @Override
        public long contentLength() throws IOException {
            return -1;
        }
    }
}
