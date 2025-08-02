foreach ($item in Get-ChildItem -Recurse -Depth 1) {
  $filename = "$($item.Name)-foo.zip"
  # Compress-Archive -Path .\sample\* -DestinationPath .\sample.zip
  Compress-Archive -Path $item.Name -DestinationPath $filename
  Get-FileHash $name -Algorithm SHA256
}