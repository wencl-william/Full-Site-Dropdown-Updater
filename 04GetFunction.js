function doGet(args) {
  return ContentService.createTextOutput(PropertiesService.getScriptProperties().getProperty(args.parameter.id)).setMimeType(ContentService.MimeType.JAVASCRIPT);
}


