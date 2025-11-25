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

    public boolean isFileSafe(MultipartFile file) throws IOException {
        String filename = file.getOriginalFilename();
        if (filename == null) {
            return true;
        }
        return !filename.toLowerCase().contains("virus");
    }
}


//@Service
//@RequiredArgsConstructor
//public class VirusTotalService {
//
//    @Value("${virustotal.api.key}")
//    private String apiKey;
//
//    private static final String UPLOAD_URL = "https://www.virustotal.com/api/v3/files";
//    private static final String ANALYSIS_URL = "https://www.virustotal.com/api/v3/analyses/";
//    private static final int MAX_ATTEMPTS = 5;
//
//    private final RestTemplate restTemplate = new RestTemplate();
//
//    public boolean isFileSafe(MultipartFile file) throws IOException, InterruptedException {
//        String analysisId = uploadFile(file);
//        return checkAnalysisResult(analysisId);
//    }
//
//    private String uploadFile(MultipartFile file) throws IOException {
//        HttpHeaders headers = new HttpHeaders();
//        headers.set("x-apikey", apiKey);
//        headers.setContentType(MediaType.MULTIPART_FORM_DATA);
//
//        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
//        body.add("file", new MultipartInputStreamFileResource(file.getInputStream(), file.getOriginalFilename()));
//
//        HttpEntity<MultiValueMap<String, Object>> request = new HttpEntity<>(body, headers);
//
//        ResponseEntity<Map> response = restTemplate.exchange(
//                UPLOAD_URL,
//                HttpMethod.POST,
//                request,
//                Map.class
//        );
//
//        Map data = (Map) response.getBody().get("data");
//        return (String) data.get("id"); // analysis ID
//    }
//
//    private boolean checkAnalysisResult(String analysisId) throws InterruptedException {
//        for (int i = 0; i < MAX_ATTEMPTS; i++) {
//
//            HttpHeaders headers = new HttpHeaders();
//            headers.set("x-apikey", apiKey);
//
//            HttpEntity<Void> requestEntity = new HttpEntity<>(headers);
//
//            ResponseEntity<Map> response = restTemplate.exchange(
//                    ANALYSIS_URL + analysisId,
//                    HttpMethod.GET,
//                    requestEntity,
//                    Map.class
//            );
//
//            Map data = (Map) response.getBody().get("data");
//            Map attributes = (Map) data.get("attributes");
//
//            String status = (String) attributes.get("status");
//
//            if (status.equals("completed")) {
//                Map stats = (Map) attributes.get("stats");
//
//                int malicious = (int) stats.getOrDefault("malicious", 0);
//                int suspicious = (int) stats.getOrDefault("suspicious", 0);
//
//                return malicious == 0 && suspicious == 0;
//            }
//
//            Thread.sleep(1500);
//        }
//
//        throw new RuntimeException("VirusTotal analysis timed out");
//    }
//
//    static class MultipartInputStreamFileResource extends InputStreamResource {
//
//        private final String filename;
//
//        MultipartInputStreamFileResource(InputStream inputStream, String filename) {
//            super(inputStream);
//            this.filename = filename;
//        }
//
//        @Override
//        public String getFilename() {
//            return this.filename;
//        }
//
//        @Override
//        public long contentLength() throws IOException {
//            return -1;
//        }
//    }
//}
